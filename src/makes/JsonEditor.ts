import {applyEdits, modify, findNodeAtLocation, getNodeValue, parseTree, JSONPath, Node, ModificationOptions} from "jsonc-parser";


export class JsonEditor<T extends object> {
    protected content: string;
    protected root: Node;
    public state: T;

    public constructor(
        protected readonly original: string
    ) {
        this.content = this.original;
        this.root = parseTree(this.content)!;
        this.state = this.createProxy([]);
    }

    protected createProxy(keys: JSONPath, options: JsonEditor.CreateProxyOptions = {}) {
        const {
            isArray,
            removeOnEmpty
        } = options;

        let target = this.get(keys);

        if(!target) {
            target = isArray ? [] : {};
        }

        return new Proxy(target, {
            get: (target, property: string) => {
                if(target && target.__proto__ && property in target.__proto__) {
                    if(typeof target[property] === "function") {
                        return (...args: any[]) => {
                            const res = target[property](...args);

                            this.set(keys, target, {
                                formattingOptions: {
                                    keepLines: false,
                                    insertSpaces: true
                                }
                            });

                            return res;
                        };
                    }

                    return target[property];
                }

                if(Array.isArray(target)) {
                    property = parseInt(property) as unknown as string;
                }

                const value = this.get([...keys, property]);

                if(value !== null && typeof value === "object") {
                    return this.createProxy([...keys, property]);
                }

                return value;
            },
            set: (_, property: string, value) => {
                if(Array.isArray(_)) {
                    property = parseInt(property) as unknown as string;
                }

                this.set([...keys, property], value, {
                    formattingOptions: {
                        keepLines: false,
                        insertSpaces: true
                    }
                });

                if(removeOnEmpty) {
                    const value = this.get(keys);

                    if(typeof value === "object" && Object.keys(value).length === 0) {
                        this.set(keys, undefined);
                    }
                }

                return true;
            },
            has: (target, property: string) => {
                return property in target;
            },
            deleteProperty: (_, property: string) => {
                if(Array.isArray(_)) {
                    property = parseInt(property) as unknown as string;
                }

                this.set([...keys, property], undefined);

                if(removeOnEmpty) {
                    const value = this.get(keys);

                    if(typeof value === "object" && Object.keys(value).length === 0) {
                        this.set(keys, undefined);
                    }
                }

                return true;
            }
        });
    };

    public get(key: string | JSONPath) {
        const path = typeof key === "string" ? key.split(".") : key;

        const node = findNodeAtLocation(this.root, path);

        if(!node) {
            return undefined;
        }

        return getNodeValue(node);
    }

    public set(key: string | JSONPath, value: any, options?: ModificationOptions): void {
        const path = typeof key === "string" ? key.split(".") : key;

        this.content = applyEdits(
            this.content,
            modify(this.content, path, value, options || {
                formattingOptions: {
                    insertSpaces: true,
                    keepLines: false
                }
            })
        );

        this.root = parseTree(this.content)!;
    }

    public unset(key: string | JSONPath): void {
        this.set(key, undefined);
    }

    public isDirty(): boolean {
        return this.content !== this.original;
    }

    public toString(): string {
        return this.content;
    }
}

export namespace JsonEditor {
    export type CreateProxyOptions = {
        isArray?: boolean;
        removeOnEmpty?: boolean;
    };
}
