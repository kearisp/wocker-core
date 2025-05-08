import {Module, ModuleMetadata} from "./Module";
import {PLUGIN_NAME_METADATA} from "../env";


type PluginConfig = ModuleMetadata & {
    [PLUGIN_NAME_METADATA]: string;
};

export const Plugin = (config: PluginConfig): ClassDecorator => {
    const {
        name,
        ...rest
    } = config;

    return (target): void => {
        Reflect.defineMetadata("isPlugin", true, target);
        Reflect.defineMetadata(PLUGIN_NAME_METADATA, name, target);

        Module(rest)(target);
    };
};
