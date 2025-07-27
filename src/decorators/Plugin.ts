import {Global} from "./Global";
import {Module} from "./Module";
import {PluginMetadata} from "../types";
import {PLUGIN_NAME_METADATA} from "../env";


export const Plugin = (config: PluginMetadata): ClassDecorator => {
    const {
        [PLUGIN_NAME_METADATA]: name,
        ...rest
    } = config;

    return (target): void => {
        Reflect.defineMetadata("isPlugin", true, target);
        Reflect.defineMetadata(PLUGIN_NAME_METADATA, name, target);

        Global()(target);
        Module(rest)(target);
    };
};
