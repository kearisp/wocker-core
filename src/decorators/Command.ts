import "reflect-metadata";

import {COMMAND_METADATA} from "../env";


export const Command = (command: string): MethodDecorator => {
    return (target: any, key: string | symbol, descriptor: TypedPropertyDescriptor<any>): void => {
        Reflect.defineMetadata(COMMAND_METADATA, command, descriptor.value);
    };
};
