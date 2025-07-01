import {Cli} from "@kearisp/cli";
import {InstanceWrapper} from "./InstanceWrapper";
import {ModuleWrapper} from "./ModuleWrapper";
import {InjectionToken, ProviderType} from "../types";
import {Type} from "../types/Type";
import {INJECT_TOKEN_METADATA} from "../env";


export class Container {
    public readonly modules: Map<Type, ModuleWrapper> = new Map();
    public readonly globalProviders: Map<InjectionToken, InstanceWrapper> = new Map();

    public constructor() {
        const cliWrapper = new InstanceWrapper(new ModuleWrapper(this, null), Cli);

        this.globalProviders.set(Cli, cliWrapper);
    }

    public addModule<TInput = any>(type: Type<TInput>, module: ModuleWrapper): void {
        this.modules.set(type, module);
    }

    public hasModule<TInput = any>(type: Type<TInput>): boolean {
        return this.modules.has(type);
    }

    public getModule<TInput = any>(type: Type<TInput>): ModuleWrapper<TInput> {
        const module = this.modules.get(type);

        if(!module) {
            throw new Error("Module not found");
        }

        return module;
    }

    public addProvider(type: InjectionToken, wrapper: InstanceWrapper): void {
        const token = typeof type !== "string"
            ? Reflect.getMetadata(INJECT_TOKEN_METADATA, type) || type
            : type;

        this.globalProviders.set(token, wrapper);
    }

    public getProvider(type: InjectionToken): InstanceWrapper | undefined {
        const token = typeof type !== "string"
            ? Reflect.getMetadata(INJECT_TOKEN_METADATA, type) || type
            : type;

        return this.globalProviders.get(token);
    }

    public replace(type: InjectionToken, provider: ProviderType): void {
        const token = typeof type !== "string"
            ? Reflect.getMetadata(INJECT_TOKEN_METADATA, type) || type
            : type;

        const wrapper: InstanceWrapper | undefined = this.globalProviders.get(token);

        if(wrapper) {
            wrapper.replace(provider);
        }

        this.modules.forEach((moduleRef): void => {
            moduleRef.replace(token, provider);
        });
    }
}
