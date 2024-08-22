import "reflect-metadata";

import {COMPLETION_METADATA} from "../env";


export const Completion = (name: string, command?: string): MethodDecorator => {
    return (_target: any, _propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
        Reflect.defineMetadata(COMPLETION_METADATA, [
            ...Reflect.getMetadata(COMPLETION_METADATA, descriptor.value) || [],
            {
                name,
                command
            }
        ], descriptor.value);
    };
};
