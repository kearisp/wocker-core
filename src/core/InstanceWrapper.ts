import {ModuleWrapper} from "./ModuleWrapper";
import {Type, ProviderType, InjectionToken} from "../types";
import {
    ARGS_METADATA,
    INJECT_TOKEN_METADATA,
    PARAMTYPES_METADATA,
    SELF_DECLARED_DEPS_METADATA
} from "../env";


export class InstanceWrapper<TInput = any> {
    protected _token: InjectionToken<TInput>;
    protected _type?: Type<TInput>;
    protected _instance?: TInput

    public constructor(
        protected readonly module: ModuleWrapper,
        protected readonly provider: ProviderType<TInput>,
    ) {
        const [token, type, instance] = this.normalizeProvider(provider);

        this._token = token;
        this._type = type;
        this._instance = instance;
    }

    protected normalizeProvider(provider: ProviderType) {
        if(provider && typeof provider === "object") {
            if("provide" in provider && "useValue" in provider) {
                return [provider.provide, null, provider.useValue];
            }

            if("provide" in provider && "useClass" in provider) {
                return [provider.provide, provider.useClass, null];
            }
        }

        return [
            Reflect.getMetadata(INJECT_TOKEN_METADATA, provider) || provider,
            provider,
            null
        ];
    }

    public get type() {
        return this._type;
    }

    public get token() {
        return this._token;
    }

    public get instance(): TInput {
        if(!this._instance) {
            if(!this._type) {
                throw new Error("Type not defined");
            }

            const types: any[] = Reflect.getMetadata(PARAMTYPES_METADATA, this._type) || [],
                  selfTypes: any[] = Reflect.getMetadata(SELF_DECLARED_DEPS_METADATA, this._type) || [],
                  argsMeta: any[] = Reflect.getMetadata(ARGS_METADATA, this._type) || [];

            if(selfTypes.length > 0) {
                selfTypes.forEach(({index, token}): void => {
                    types[index] = token;
                });
            }

            const params: any[] = types.map((type: any, index) => {
                const optional: boolean = (argsMeta[index] || {}).optional || false;

                return this.module.get(type, optional);
            });

            this._instance = new this._type(...params);
        }

        return this._instance;
    }

    public replace(provider: ProviderType<TInput>): void {
        const [token, type, instance] = this.normalizeProvider(provider);

        this._token = token;
        this._type = type;
        this._instance = instance;
    }
}
