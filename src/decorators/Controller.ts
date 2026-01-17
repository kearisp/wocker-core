import {IS_CONTROLLER_METADATA} from "../env";


export const Controller = (): ClassDecorator => {
    return (target) => {
        Reflect.defineMetadata(IS_CONTROLLER_METADATA, true, target);
    };
};
