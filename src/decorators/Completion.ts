import "reflect-metadata";
import {COMPLETION_METADATA} from "../env";


export const Completion = (name: string, command?: string): MethodDecorator => {
    return (_target: Object, _propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>): void => {
        Reflect.defineMetadata(COMPLETION_METADATA, [
            {
                name,
                command
            },
            ...Reflect.getMetadata(COMPLETION_METADATA, descriptor.value) || []
        ], descriptor.value);
    };
};
