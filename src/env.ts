import OS from "os";
import Path from "path";


export const WOCKER_VERSION = "1.0.27";
export const WOCKER_VERSION_KEY = "__WOCKER_VERSION__";
export const WOCKER_DATA_DIR: string = process.env.WS_DIR || Path.join(OS.homedir(), ".workspace");
export const WOCKER_DATA_DIR_KEY = "__WOCKER_DATA_DIR__";
export const FILE_SYSTEM_DRIVER_KEY = "__FILE_SYSTEM_DRIVER_";
export const PLUGIN_DIR_KEY = "PLUGIN_DIR";
export const IS_CONTROLLER_METADATA = "IS_CONTROLLER";
export const IS_GLOBAL_METADATA = "IS_GLOBAL";
export const IS_MODULE_METADATA = "isModule";
export const INJECTABLE_WATERMARK = "__injectable__";
export const DESCRIPTION_METADATA = "__DESCRIPTION__";
export const COMMAND_METADATA = "command";
export const COMPLETION_METADATA = "completion";
export const LISTENER_METADATA = "__LISTENER_METADATA__";
export const ARGS_METADATA = "__ARGS_METADATA__";
export const ARGS_OLD_METADATA = "__ARGS__";
export const ALIAS_METADATA = "__ALIAS_METADATA__";
export const PARAMTYPES_METADATA = "design:paramtypes";
export const SELF_DECLARED_DEPS_METADATA = "self:paramtypes";
export const INJECT_TOKEN_METADATA = "INJECT_TOKEN";
export const PLUGIN_NAME_METADATA = "name";
export enum MODULE_METADATA {
    IMPORTS = "imports",
    EXPORTS = "exports",
    CONTROLLERS = "controllers",
    PROVIDERS = "providers"
}
