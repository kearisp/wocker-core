import {
    ARGS_METADATA,
    ARGS_OLD_METADATA
} from "../env";


export const Param = (name: string): ParameterDecorator => {
    return (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number): void => {
        if(!propertyKey) {
            return;
        }

        const {
            [parameterIndex]: options,
            ...rest
        } = Reflect.getMetadata(ARGS_METADATA, target.constructor, propertyKey) || {};

        Reflect.defineMetadata(ARGS_METADATA, {
            ...rest,
            [parameterIndex]: {
                ...options || {},
                type: "param",
                name,
                index: parameterIndex
            },
        }, target.constructor, propertyKey);

        Reflect.defineMetadata(ARGS_OLD_METADATA, [
            ...Reflect.getMetadata(ARGS_OLD_METADATA, target.constructor, propertyKey) || [],
            {
                type: "param",
                name,
                index: parameterIndex
            }
        ], target.constructor, propertyKey);
    };
};
