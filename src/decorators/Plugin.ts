import {Module, ModuleConfig} from "./Module";
import {PLUGIN_NAME_METADATA} from "../env";


type PluginConfig = ModuleConfig & {
    [PLUGIN_NAME_METADATA]: string
};

export const Plugin = (config: PluginConfig): ClassDecorator => {
    const {
        name,
        ...rest
    } = config;

    return (target): void => {
        Reflect.defineMetadata("isPlugin", true, target);
        Reflect.defineMetadata(PLUGIN_NAME_METADATA, true, target);

        Module(rest)(target);
    };
};
