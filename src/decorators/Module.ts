import {MODULE_METADATA} from "../env";
import {Provider} from "../types/Provider";
import {Type} from "../types/Type";


type Config = {
    [MODULE_METADATA.NAME]?: string;
    [MODULE_METADATA.CONTROLLERS]?: any[];
    [MODULE_METADATA.PROVIDERS]?: Provider[];
    [MODULE_METADATA.IMPORTS]?: any[];
    [MODULE_METADATA.EXPORTS]?: any[];
};

export type DynamicModule = {
    providers?: any[];
};

export const Module = (config: Config) => {
    const {
        [MODULE_METADATA.NAME]: name,
        [MODULE_METADATA.CONTROLLERS]: controllers = [],
        [MODULE_METADATA.PROVIDERS]: providers = [],
        [MODULE_METADATA.IMPORTS]: imports = [],
        [MODULE_METADATA.EXPORTS]: exports = []
    } = config;

    return <T extends Type>(Target: T) => {
        Reflect.defineMetadata("isModule", true, Target);
        Reflect.defineMetadata(MODULE_METADATA.NAME, name, Target);
        Reflect.defineMetadata(MODULE_METADATA.IMPORTS, imports, Target);
        Reflect.defineMetadata(MODULE_METADATA.CONTROLLERS, controllers, Target);
        Reflect.defineMetadata(MODULE_METADATA.PROVIDERS, providers, Target);
        Reflect.defineMetadata(MODULE_METADATA.EXPORTS, exports, Target);
    };
};
