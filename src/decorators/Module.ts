import {MODULE_METADATA, IS_MODULE_METADATA} from "../env";
import {ModuleMetadata} from "../types";


export const Module = (config: ModuleMetadata): ClassDecorator => {
    const {
        [MODULE_METADATA.CONTROLLERS]: controllers = [],
        [MODULE_METADATA.PROVIDERS]: providers = [],
        [MODULE_METADATA.IMPORTS]: imports = [],
        [MODULE_METADATA.EXPORTS]: exports = []
    } = config;

    return (target): void => {
        Reflect.defineMetadata(IS_MODULE_METADATA, true, target);
        Reflect.defineMetadata(MODULE_METADATA.IMPORTS, imports, target);
        Reflect.defineMetadata(MODULE_METADATA.CONTROLLERS, controllers, target);
        Reflect.defineMetadata(MODULE_METADATA.PROVIDERS, providers, target);
        Reflect.defineMetadata(MODULE_METADATA.EXPORTS, exports, target);
    };
};

