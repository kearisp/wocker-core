import {MODULE_METADATA} from "../env";
import {ProviderType} from "./ProviderType";
import {Type} from "./Type";
import {DynamicModule} from "./DynamicModule";
import {InjectionToken} from "./InjectionToken";


export type ModuleMetadata = {
    [MODULE_METADATA.IMPORTS]?: Array<Type | DynamicModule>;
    [MODULE_METADATA.CONTROLLERS]?: Type[];
    [MODULE_METADATA.PROVIDERS]?: ProviderType[];
    [MODULE_METADATA.EXPORTS]?: Array<InjectionToken | Type>;
};
