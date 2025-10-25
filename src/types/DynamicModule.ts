import {InjectionToken} from "./InjectionToken";
import {Type} from "./Type";
import {ModuleMetadata} from "./ModuleMetadata";


export type DynamicModule = ModuleMetadata & {
    module: Type;
    global?: boolean;
    inject?: Array<InjectionToken | Type>;
    useFactory?: (...args: any[]) => ModuleMetadata | Promise<ModuleMetadata>;
};
