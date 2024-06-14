import "reflect-metadata";

import {COMMAND_DESCRIPTION_METADATA} from "../env";


export const Description = (description: string): MethodDecorator => {
    return (target, propertyKey, descriptor): void => {
        Reflect.defineMetadata(COMMAND_DESCRIPTION_METADATA, description, descriptor);
    };
};
