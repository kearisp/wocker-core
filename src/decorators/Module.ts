import {MODULE_METADATA, PLUGIN_NAME_METADATA} from "../env";
import {Provider} from "../types/Provider";


export type ModuleConfig = {
    /**
     * @deprecated
     */
    [PLUGIN_NAME_METADATA]?: string;
    [MODULE_METADATA.CONTROLLERS]?: any[];
    [MODULE_METADATA.PROVIDERS]?: Provider[];
    [MODULE_METADATA.IMPORTS]?: any[];
    [MODULE_METADATA.EXPORTS]?: any[];
};

export const Module = (config: ModuleConfig): ClassDecorator => {
    const {
        [PLUGIN_NAME_METADATA]: name,
        [MODULE_METADATA.CONTROLLERS]: controllers = [],
        [MODULE_METADATA.PROVIDERS]: providers = [],
        [MODULE_METADATA.IMPORTS]: imports = [],
        [MODULE_METADATA.EXPORTS]: exports = []
    } = config;

    return (target) => {
        Reflect.defineMetadata("isModule", true, target);
        Reflect.defineMetadata(PLUGIN_NAME_METADATA, name, target);
        Reflect.defineMetadata(MODULE_METADATA.IMPORTS, imports, target);
        Reflect.defineMetadata(MODULE_METADATA.CONTROLLERS, controllers, target);
        Reflect.defineMetadata(MODULE_METADATA.PROVIDERS, providers, target);
        Reflect.defineMetadata(MODULE_METADATA.EXPORTS, exports, target);
    };
};
