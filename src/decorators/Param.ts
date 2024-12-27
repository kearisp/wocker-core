import {ARGS_METADATA} from "../env";


export const Param = (name: string): ParameterDecorator => {
    return (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number): void => {
        if(!propertyKey) {
            return;
        }

        Reflect.defineMetadata(ARGS_METADATA, [
            ...Reflect.getMetadata(ARGS_METADATA, target.constructor, propertyKey) || [],
            {
                type: "param",
                name,
                index: parameterIndex
            }
        ], target.constructor, propertyKey);
    };
};
