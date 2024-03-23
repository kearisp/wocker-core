import {SELF_DECLARED_DEPS_METADATA} from "../env";


export const Inject = <T = any>(token?: T): ParameterDecorator => {
    return (target, propertyKey, parameterIndex) => {
        // console.log(">_<", token, target, propertyKey, parameterIndex);

        Reflect.defineMetadata(SELF_DECLARED_DEPS_METADATA, [
            ...Reflect.getMetadata(SELF_DECLARED_DEPS_METADATA, target) || [],
            {
                token: token,
                index: parameterIndex
            }
        ], target);
    };
};
