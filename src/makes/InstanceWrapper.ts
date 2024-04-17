import "reflect-metadata";

import {Module} from "./Module";
import {
    PARAMTYPES_METADATA,
    SELF_DECLARED_DEPS_METADATA
} from "../env";


export class InstanceWrapper {
    public constructor(
        private readonly module: Module,
        private readonly provider: any,
        private _instance?: any
    ) {}

    get instance() {
        if(!this._instance) {
            const types = [
                ...Reflect.getMetadata(PARAMTYPES_METADATA, this.provider) || []
            ];

            const selfTypes: any[] = Reflect.getMetadata(SELF_DECLARED_DEPS_METADATA, this.provider) || [];

            if(selfTypes.length > 0) {
                selfTypes.forEach(({index, token}) => {
                    types[index] = token;
                });
            }

            const params: any[] = types.map((type: any) => {
                const wrapper = this.module.getWrapper(type);

                if(!wrapper) {
                    return undefined;
                }

                return wrapper.instance;
            });

            this._instance = new this.provider(...params);
        }

        return this._instance;
    }

    set instance(instance: any) {
        this._instance = instance;
    }
}