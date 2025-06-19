import OS from "os";
import Path from "path";


export const IS_GLOBAL_METADATA = "IS_GLOBAL";
export const IS_MODULE_METADATA = "isModule";
export const INJECTABLE_WATERMARK = "__injectable__";
export const DESCRIPTION_METADATA = "__DESCRIPTION__";
export const COMMAND_METADATA = "command";
export const COMPLETION_METADATA = "completion";
export const ARGS_METADATA = "__ARGS__";
export const ALIAS_METADATA = "__ALIAS_METADATA__";
export const OPTION_META = "__OPTION_META__";
export const PARAMTYPES_METADATA = "design:paramtypes";
export const SELF_DECLARED_DEPS_METADATA = "self:paramtypes";
export const INJECT_TOKEN_METADATA = "INJECT_TOKEN";
export const PLUGIN_DIR_KEY = "PLUGIN_DIR";
export const PLUGIN_NAME_METADATA = "name";
export enum MODULE_METADATA {
    IMPORTS = "imports",
    EXPORTS = "exports",
    CONTROLLERS = "controllers",
    PROVIDERS = "providers"
}
export const DATA_DIR: string = process.env.WS_DIR || Path.join(OS.homedir(), ".workspace");
export const WOCKER_VERSION_KEY = "__WOCKER_VERSION__";
export const WOCKER_DATA_DIR_KEY = "__WOCKER_DATA_DIR__";
