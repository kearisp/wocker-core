import {Provider} from "../types/Provider";
import {Type} from "../types/Type";
import {Container} from "./Container";
import {InstanceWrapper} from "./InstanceWrapper";
import {INJECT_TOKEN_METADATA} from "../env";


export class Module<TInput = any> {
    public imports: Map<any, InstanceWrapper> = new Map();
    public controllers: Map<any, InstanceWrapper> = new Map();
    public providers: Map<any, InstanceWrapper> = new Map();
    public exports: Set<any> = new Set();

    public constructor(
        public readonly container: Container,
        public type: TInput,
        public parent?: Module
    ) {}

    public get<TInput = any, TResult = TInput>(type: Type<TInput> | Function | string | symbol): TResult {
        const wrapper = this.getWrapper(type);

        if(!wrapper) {
            throw new Error("Provider not found");
        }

        return wrapper.instance;
    }

    public getWrapper(type: any): InstanceWrapper | undefined {
        const token = typeof type !== "string"
            ? Reflect.getMetadata(INJECT_TOKEN_METADATA, type) || type
            : type;

        const wrapper = this.providers.get(token);

        if(!wrapper && this.parent) {
            return this.parent.getWrapper(type);
        }

        if(!wrapper) {
            return this.container.providers.get(type);
        }

        return wrapper;
    }

    public addImport(module: any): void {
        // this.imports.add(module);
    }

    public addProvider(provider: Provider, instance?: any): void {
        const wrapper = new InstanceWrapper(this, provider, instance);

        this.providers.set(wrapper.token, wrapper);
    }

    public getProvider() {
        //
    }

    public addInjection(): void {
        //
    }

    public addController(type: any): void {
        this.controllers.set(type, new InstanceWrapper(this, type));

        for(const name of Object.getOwnPropertyNames(type.prototype)) {
            const descriptor = Object.getOwnPropertyDescriptor(type.prototype, name);

            if(!descriptor) {
                continue;
            }

            const command = Reflect.getMetadata("command", descriptor.value);

            if(!command) {
                continue;
            }

            // console.log(">", name, command);
        }
    }

    public addExport(type: any): void {
        this.exports.add(type);
    }
}