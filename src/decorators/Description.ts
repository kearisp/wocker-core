import "reflect-metadata";

import {COMMAND_DESCRIPTION_METADATA} from "../env";


export const Description = (description: string): MethodDecorator => {
    return (_target: Object, _propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>): void => {
        Reflect.defineMetadata(COMMAND_DESCRIPTION_METADATA, description, descriptor.value);
    };
};
