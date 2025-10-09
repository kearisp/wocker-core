import "reflect-metadata";
import {Option as O} from "@kearisp/cli";
import {
    ARGS_METADATA,
    ARGS_OLD_METADATA
} from "../env";


type AliasOrParams = string | Partial<Omit<O, "name">>;

export const Option = (name: string, aliasOrParams?: AliasOrParams): ParameterDecorator => {
    return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number): void => {
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
                name,
                type: "option",
                params: typeof aliasOrParams === "string"
                    ? {alias: aliasOrParams}
                    : aliasOrParams
            },
        }, target.constructor, propertyKey);

        Reflect.defineMetadata(ARGS_OLD_METADATA, [
            {
                type: "option",
                name,
                params: typeof aliasOrParams === "string" ? {alias: aliasOrParams} : aliasOrParams,
                index: parameterIndex
            },
            ...Reflect.getMetadata(ARGS_OLD_METADATA, target.constructor, propertyKey) || []
        ], target.constructor, propertyKey);
    };
};
