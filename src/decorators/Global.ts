import {IS_GLOBAL_METADATA} from "../env";


export const Global = (): ClassDecorator => {
    return (target): void => {
        Reflect.defineMetadata(IS_GLOBAL_METADATA, true, target);
    };
};
