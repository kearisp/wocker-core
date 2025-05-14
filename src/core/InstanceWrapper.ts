import {Module} from "./Module";
import {Provider} from "../types/Provider";
import {Type} from "../types/Type";
import {InjectionToken} from "../types/InjectionToken";
import {
    INJECT_TOKEN_METADATA,
    PARAMTYPES_METADATA,
    SELF_DECLARED_DEPS_METADATA
} from "../env";


export class InstanceWrapper<TInput = any> {
    public readonly token: InjectionToken<TInput>;
    public readonly type?: Type<TInput>;

    public constructor(
        protected readonly module: Module,
        protected readonly provider: Provider<TInput>,
        protected _instance?: TInput
    ) {
        if("provide" in this.provider && "useValue" in this.provider) {
            this.token = this.provider.provide;
            this._instance = this.provider.useValue;
            return;
        }

        if("provide" in this.provider && "useClass" in this.provider) {
            this.token = this.provider.provide;
            this.type = this.provider.useClass;
            return;
        }

        this.token = Reflect.getMetadata(INJECT_TOKEN_METADATA, this.provider) || this.provider;
        this.type = this.provider;
    }

    public get instance(): TInput {
        if(!this._instance) {
            if(!this.type) {
                throw new Error("Type not defined");
            }

            const types: any[] = Reflect.getMetadata(PARAMTYPES_METADATA, this.type) || [];
            const selfTypes: any[] = Reflect.getMetadata(SELF_DECLARED_DEPS_METADATA, this.type) || [];

            if(selfTypes.length > 0) {
                selfTypes.forEach(({index, token}): void => {
                    types[index] = token;
                });
            }

            const params: any[] = types.map((type: any) => {
                return this.module.get(type);
            });

            this._instance = new this.type(...params);
        }

        return this._instance;
    }
}
