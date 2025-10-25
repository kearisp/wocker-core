import {ARGS_METADATA} from "../env";


export const Optional = (): ParameterDecorator => {
    return (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number): void => {
        const metadata = propertyKey
            ? Reflect.getMetadata(ARGS_METADATA, target.constructor, propertyKey) || {}
            : Reflect.getMetadata(ARGS_METADATA, target) || {};

        if(!metadata[parameterIndex]) {
            metadata[parameterIndex] = {};
        }

        metadata[parameterIndex] = {
            ...metadata[parameterIndex],
            optional: true
        };

        if(propertyKey) {
            Reflect.defineMetadata(ARGS_METADATA, metadata, target.constructor, propertyKey);
        }
        else {
            Reflect.defineMetadata(ARGS_METADATA, metadata, target);
        }
    };
};
