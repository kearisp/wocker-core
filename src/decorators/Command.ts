import "reflect-metadata";
import {COMMAND_METADATA} from "../env";


export const Command = (command: string): MethodDecorator => {
    return (_target: any, _key: string | symbol, descriptor: TypedPropertyDescriptor<any>): void => {
        Reflect.defineMetadata(COMMAND_METADATA, [
            ...Reflect.getMetadata(COMMAND_METADATA, descriptor.value) || [],
            command
        ], descriptor.value);
    };
};
