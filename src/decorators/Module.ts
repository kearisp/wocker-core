import {MODULE_METADATA, IS_MODULE_METADATA} from "../env";
import {ProviderType} from "../types/ProviderType";


export type ModuleMetadata = {
    [MODULE_METADATA.CONTROLLERS]?: any[];
    [MODULE_METADATA.PROVIDERS]?: ProviderType[];
    [MODULE_METADATA.IMPORTS]?: any[];
    [MODULE_METADATA.EXPORTS]?: any[];
};

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

