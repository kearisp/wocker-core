import {Provider} from "../types/Provider";
import {Factory} from "./Factory";
import {InstanceWrapper} from "./InstanceWrapper";
import {INJECT_TOKEN_METADATA} from "../env";


export class Module {
    public imports: Set<any> = new Set();
    public controllers: Map<any, InstanceWrapper> = new Map();
    public providers: Map<any, InstanceWrapper> = new Map();
    public exports: Map<any, any> = new Map();

    public constructor(
        public type: any,
        public parent?: Module
    ) {}

    public get<T = any>(type: any): T {
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

        return wrapper;
    }

    public addImport(module: any): void {
        this.imports.add(module);
    }

    public addProvider(provider: Provider, instance?: any): void {
        if("provide" in provider && "useValue" in provider) {
            const wrapper = new InstanceWrapper(this, provider.provide, provider.provide, provider.useValue);

            this.providers.set(provider.provide, wrapper);
            return;
        }

        const token = Reflect.getMetadata("INJECT_TOKEN", provider) || provider;
        const wrapper = new InstanceWrapper(this, token, provider, instance);

        this.providers.set(token, wrapper);
    }

    public addInjection(): void {
        //
    }

    public addController(type: any): void {
        this.controllers.set(type, new InstanceWrapper(this, type, type));

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
}