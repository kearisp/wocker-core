import {applyEdits, modify, findNodeAtLocation, getNodeValue, parseTree, JSONPath, Node, ModificationOptions} from "jsonc-parser";


type OrderMap = {
    [key: string]: string[] | ((key: string, properties: string[]) => number);
};

export class JsonEditor<T extends object> {
    protected content: string;
    protected root: Node;
    public state: T;

    public constructor(
        protected readonly original: string,
        protected readonly orderMap: OrderMap = {}
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

                            this.set(keys, target);

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

                this.set([...keys, property], value);

                if(removeOnEmpty) {
                    const value = this.get(keys);

                    if(typeof value === "object" && Object.keys(value).length === 0) {
                        this.unset(keys);
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

                this.unset([...keys, property]);

                if(removeOnEmpty) {
                    const value = this.get(keys);

                    if(typeof value === "object" && Object.keys(value).length === 0) {
                        this.unset(keys);
                    }
                }

                return true;
            }
        });
    }

    protected getInsertionIndex(path: JSONPath): ((properties: string[]) => number) | undefined {
        const key = path[path.length - 1] as string,
              orderKey = path.slice(0, -1).join("."),
              ordered = this.orderMap[orderKey];

        if(!ordered) {
            return undefined;
        }

        return (properties) => {
            if(typeof ordered === "function") {
                return ordered(key as string, properties);
            }

            const keyIndex = ordered.indexOf(key as string);

            if(keyIndex === -1) {
                return properties.length;
            }

            let insertIndex = 0;

            for(const property of properties) {
                const propertyIndex = ordered.indexOf(property);

                if(propertyIndex !== -1 && propertyIndex < keyIndex) {
                    insertIndex++;
                }
            }

            return insertIndex;
        };
    }

    public get(key: string | JSONPath) {
        const path = typeof key === "string" ? key.split(".") : key;

        const node = findNodeAtLocation(this.root, path);

        if(!node) {
            return undefined;
        }

        return JsonEditor.getNodeValue(node);
    }

    public set(key: string | JSONPath, value: any, options?: ModificationOptions): void {
        const path = typeof key === "string" ? key.split(".") : key;

        this.content = applyEdits(
            this.content,
            modify(this.content, path, value, options || {
                formattingOptions: {
                    insertSpaces: true,
                    keepLines: false,
                    insertFinalNewline: true
                },
                getInsertionIndex: this.getInsertionIndex(path)
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

    public static getNodeValue(node: Node) {
        switch(node.type) {
            case "array":
                return node.children?.map(getNodeValue);

            case "object": {
                const obj = Object.create({});

                if(node.children) {
                    for(let prop of node.children) {
                        const [keyNode, valueNode] = prop.children || [];

                        if(keyNode && valueNode) {
                            obj[keyNode.value] = this.getNodeValue(valueNode);
                        }
                    }
                }

                return obj;
            }

            case "null":
            case "string":
            case "number":
            case "boolean":
                return node.value;

            default:
                return undefined;
        }
    }
}

export namespace JsonEditor {
    export type CreateProxyOptions = {
        isArray?: boolean;
        removeOnEmpty?: boolean;
    };
}
