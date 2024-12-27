import {Provider} from "../types/Provider";
import {Type} from "../types/Type";
import {Container} from "./Container";
import {InstanceWrapper} from "./InstanceWrapper";
import {ControllerWrapper} from "./ControllerWrapper";
import {INJECT_TOKEN_METADATA} from "../env";


export class Module<TInput = any> {
    public imports: Map<any, InstanceWrapper> = new Map();
    public controllers: Map<any, ControllerWrapper> = new Map();
    public providers: Map<any, InstanceWrapper> = new Map();
    public exports: Set<any> = new Set();

    public constructor(
        public readonly container: Container,
        public readonly type: TInput
    ) {}

    public get<TInput = any, TResult = TInput>(type: Type<TInput> | Function | string | symbol): TResult {
        const wrapper = this.getWrapper(type);

        if(!wrapper) {
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

    public getWrapper(type: any): InstanceWrapper | undefined {
        const token = typeof type === "function"
            ? Reflect.getMetadata(INJECT_TOKEN_METADATA, type) || type
            : type;

        const wrapper = this.providers.get(token);

        if(!wrapper) {
            return this.container.providers.get(token);
        }

        return wrapper;
    }

    public addProvider(provider: Provider, instance?: any): void {
        const wrapper = new InstanceWrapper(this, provider, instance);

        this.providers.set(wrapper.token, wrapper);
    }

    public addController(type: any): void {
        const controllerWrapper = new ControllerWrapper(this, type);

        this.controllers.set(type, controllerWrapper);
    }

    public addExport(type: any): void {
        const token = typeof type !== "string"
            ? Reflect.getMetadata(INJECT_TOKEN_METADATA, type) || type
            : type;

        this.exports.add(token);
    }
}