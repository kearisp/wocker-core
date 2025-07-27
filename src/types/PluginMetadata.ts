import {ModuleMetadata} from "./ModuleMetadata";
import {PLUGIN_NAME_METADATA} from "../env";


export type PluginMetadata = ModuleMetadata & {
    [PLUGIN_NAME_METADATA]: string;
};
