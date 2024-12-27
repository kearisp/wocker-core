import "reflect-metadata";
import {Option as O} from "@kearisp/cli";

import {ARGS_METADATA} from "../env";


type AliasOrParams = string | Partial<Omit<O, "name">>;

export const Option = (name: string, aliasOrParams?: AliasOrParams): ParameterDecorator => {
    return (target: object, key: string | symbol | undefined, index: number): void => {
        if(!key) {
            return;
        }

        Reflect.defineMetadata(ARGS_METADATA, [
            {
                type: "option",
                name,
                params: typeof aliasOrParams === "string" ? {alias: aliasOrParams} : aliasOrParams,
                index
            },
            ...Reflect.getMetadata(ARGS_METADATA, target.constructor, key) || []
        ], target.constructor, key);
    };
};
