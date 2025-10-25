import {InjectionToken, ModuleMetadata, ProviderType, Type} from "../types";
import {Container} from "./Container";
import {InstanceWrapper} from "./InstanceWrapper";
import {ControllerWrapper} from "./ControllerWrapper";
import {INJECT_TOKEN_METADATA} from "../env";


export class ModuleWrapper<TInput = any> {
    public global: boolean = false;
    public imports: Set<ModuleWrapper> = new Set();
    public controllers: Map<any, ControllerWrapper> = new Map();
    public providers: Map<any, InstanceWrapper> = new Map();
    public exports: Set<any> = new Set();
    public factory?: (...args: any[]) => ModuleMetadata | Promise<ModuleMetadata>;
    public factoryInject?: any[];

    public constructor(
        public readonly container: Container,
        public readonly type: TInput
    ) {}

    public get<TInput = any, TResult = TInput>(type: InjectionToken<TInput>): TResult;
    public get<TInput = any, TResult = TInput, O extends boolean = boolean>(type: InjectionToken<TInput>, optional: O): O extends true ? TResult | undefined : TResult;
    public get<TInput = any, TResult = TInput>(type: InjectionToken<TInput>, optional?: boolean): TResult | undefined {
        const wrapper = this.getWrapper(type);

        if(!wrapper) {
            if(optional) {
                return undefined;
            }

            if(typeof type === "function") {
                throw new Error(`Provider "${type.prototype.constructor.name}" not found`);
            }
            else if(typeof type === "string") {
                throw new Error(`Provider "${type}" not found`);
            }

            throw new Error("Provider not found");
        }

        return wrapper.instance;
    }

    public getWrapper(type: InjectionToken): InstanceWrapper | undefined {
        const token = typeof type === "function"
            ? Reflect.getMetadata(INJECT_TOKEN_METADATA, type) || type
            : type;

        const wrapper = this.providers.get(token);

        if(!wrapper) {
            for(const im of this.imports) {
                if(!im.exports.has(token)) {
                    continue;
                }

                const wrapper = im.getWrapper(token);

                if(wrapper) {
                    return wrapper;
                }
            }

            return this.container.globalProviders.get(token);
        }

        return wrapper;
    }

    public addProvider(provider: ProviderType): void {
        const wrapper = new InstanceWrapper(this, provider);

        this.providers.set(wrapper.token, wrapper);
    }

    public addController(type: Type): void {
        const controllerWrapper = new ControllerWrapper(this, type);

        this.controllers.set(type, controllerWrapper);
    }

    public addImport(module: ModuleWrapper): void {
        this.imports.add(module);
    }

    public addExport(type: InjectionToken | Type): void {
        const token = typeof type !== "string"
            ? Reflect.getMetadata(INJECT_TOKEN_METADATA, type) || type
            : type;

        this.exports.add(token);

        const indexes = this.container.moduleExportIndex.get(token) || new Set();

        indexes.add(this);

        this.container.moduleExportIndex.set(token, indexes);
    }

    public replace(token: InjectionToken, provider: ProviderType): void {
        const wrapper = this.getWrapper(token);

        if(!wrapper) {
            return;
        }

        wrapper.replace(provider);
    }
}
