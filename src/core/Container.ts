import {Cli} from "@kearisp/cli";
import {InstanceWrapper} from "./InstanceWrapper";
import {Module} from "./Module";
import {InjectionToken} from "../types/InjectionToken";
import {Type} from "../types/Type";
import {INJECT_TOKEN_METADATA} from "../env";


export class Container {
    public readonly modules: Map<Type, Module> = new Map();
    public readonly providers: Map<InjectionToken, InstanceWrapper> = new Map();

    public constructor() {
        const cliWrapper = new InstanceWrapper(new Module(this, null), Cli);

        this.providers.set(Cli, cliWrapper);
    }

    public addModule<TInput = any>(type: Type<TInput>, module: Module): void {
        this.modules.set(type, module);
    }

    public hasModule<TInput = any>(type: Type<TInput>): boolean {
        return this.modules.has(type);
    }

    public getModule<TInput = any>(type: Type<TInput>): Module<TInput> {
        const module = this.modules.get(type);

        if(!module) {
            throw new Error("Module not found");
        }

        return module;
    }

    public addProvider(type: Type, wrapper: InstanceWrapper): void {
        const token = typeof type !== "string"
            ? Reflect.getMetadata(INJECT_TOKEN_METADATA, type) || type
            : type;

        this.providers.set(token, wrapper);
    }
}
