import "reflect-metadata";
import {Option as O} from "@kearisp/cli";
import {
    ARGS_METADATA,
    ARGS_METADATA_OLD
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
                type: "option",
                name,
                params: typeof aliasOrParams === "string" ? {alias: aliasOrParams} : aliasOrParams,
                index: parameterIndex
            },
        }, target.constructor, propertyKey);

        Reflect.defineMetadata(ARGS_METADATA_OLD, [
            {
                type: "option",
                name,
                params: typeof aliasOrParams === "string" ? {alias: aliasOrParams} : aliasOrParams,
                index: parameterIndex
            },
            ...Reflect.getMetadata(ARGS_METADATA_OLD, target.constructor, propertyKey) || []
        ], target.constructor, propertyKey);
    };
};
