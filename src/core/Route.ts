import {Type} from "../types";
import {ArgMeta} from "../types/ArgMeta";
import {
    ARGS_METADATA,
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
              argsAliases = Reflect.getMetadata(ALIAS_METADATA, this.type, this.method) || {};

        for(const index in argsMetadata) {
            const argMeta: ArgMeta = argsMetadata[index];

            if(argMeta.type === "param") {
                this.args[argMeta.index] = {
                    type: argMeta.type,
                    name: argMeta.name,
                    params: {
                        description: argMeta.description,
                    }
                };
            }

            if(argMeta.type === "option") {
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
                        description: argMeta.description || description
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
