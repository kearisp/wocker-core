import {Type} from "../types";
import {ArgMeta, ArgOldMeta} from "../types/ArgMeta";
import {
    ARGS_METADATA,
    ARGS_OLD_METADATA,
    COMMAND_METADATA,
    COMPLETION_METADATA,
    PARAMTYPES_METADATA,
    ALIAS_METADATA,
    DESCRIPTION_METADATA
} from "../env";


export class Route {
    public description?: string;
    public args: {
        type: "param" | "option";
        name: string;
        params: any;
    }[] = [];
    public designTypes: any[] = [];
    public commandNames: string[] = [];
    public completions: {
        name: string;
        command?: string;
    }[] = [];

    public constructor(
        public readonly type: Type,
        public readonly method: string
    ) {
        const descriptor = Object.getOwnPropertyDescriptor(this.type.prototype, this.method);

        if(!descriptor) {
            return;
        }

        this.description = Reflect.getMetadata(DESCRIPTION_METADATA, descriptor.value) || "";
        this.commandNames = Reflect.getMetadata(COMMAND_METADATA, descriptor.value) || [];
        this.completions = Reflect.getMetadata(COMPLETION_METADATA, descriptor.value) || [];
        this.designTypes = Reflect.getMetadata(PARAMTYPES_METADATA, this.type.prototype, this.method) || [];

        const argsMetadata = Reflect.getMetadata(ARGS_METADATA, this.type, this.method) || [],
              argsOldMetadata = Reflect.getMetadata(ARGS_OLD_METADATA, this.type, this.method) || [],
              argsDescription = Reflect.getMetadata(DESCRIPTION_METADATA, this.type, method) || {},
              argsAliases = Reflect.getMetadata(ALIAS_METADATA, this.type, this.method) || {};

        for(const key in argsMetadata) {
            const index = key as unknown as number,
                  argMeta: ArgMeta = argsMetadata[index];

            if(argMeta.type === "param") {
                this.args[index] = {
                    type: argMeta.type,
                    name: argMeta.name,
                    params: {
                        description: argMeta.description
                    }
                };
            }
            else if(argMeta.type === "option") {
                const {
                    type,
                    alias,
                    description
                } = argMeta.params || {};

                this.args[index] = {
                    type: argMeta.type,
                    name: argMeta.name,
                    params: {
                        ...argMeta.params,
                        type: this.getArgType(index) || type,
                        alias: argsAliases[index] || alias,
                        description: argMeta.description || description
                    }
                };
            }
        }

        for(let i = 0; i < argsOldMetadata.length; i++) {
            const argMeta: ArgOldMeta = argsOldMetadata[i];

            if(argMeta.type === "param") {
                this.args[argMeta.index] = {
                    type: argMeta.type,
                    name: argMeta.name,
                    params: {
                        description: argsDescription[argMeta.index] || ""
                    }
                };
            }
            else if(argMeta.type === "option") {
                const {
                    type,
                    alias,
                    description
                } = argMeta.params || {};

                this.args[argMeta.index] = {
                    type: argMeta.type,
                    name: argMeta.name,
                    params: {
                        ...argMeta.params,
                        type: this.getArgType(argMeta.index) || type,
                        alias: argsAliases[argMeta.index] || alias,
                        description: argsDescription[argMeta.index] || description
                    }
                };
            }
        }
    }

    public get isCommand(): boolean {
        return this.commandNames.length > 0;
    }

    public get isCompletion(): boolean {
        return this.completions.length > 0;
    }

    public getArgType(index: number): string | undefined {
        switch(this.designTypes[index]) {
            case String:
                return "string";

            case Boolean:
                return "boolean";

            case Number:
                return "number";

            default:
                return undefined;
        }
    }
}
