import {LISTENER_METADATA} from "../env";


export const Event = (handle: string): MethodDecorator => {
    return (_target: any, _key: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
        Reflect.defineMetadata(LISTENER_METADATA, [
            ...Reflect.getMetadata(LISTENER_METADATA, descriptor.value) || [],
            handle
        ], descriptor.value);
    };
};
