import {Option as O} from "@kearisp/cli";

import {ARGS_METADATA} from "../env";


type Params = Omit<O, "name">;

export const Option = (name: string, params?: Partial<Params>): ParameterDecorator => {
    return (target: object, key: string | symbol | undefined, index: number): void => {
        if(!key) {
            return;
        }

        Reflect.defineMetadata(ARGS_METADATA, [
            ...Reflect.getMetadata(ARGS_METADATA, target.constructor, key) || [],
            {
                type: "option",
                name,
                params,
                index
            }
        ], target.constructor, key);
    };
};
