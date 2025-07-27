import "reflect-metadata";
import {DESCRIPTION_METADATA, ARGS_METADATA} from "../env";


type UniversalDecorator = ClassDecorator & MethodDecorator & PropertyDecorator & ParameterDecorator

export const Description = (description: string): UniversalDecorator => {
    return (
        target: Object | Function,
        propertyKey?: string | symbol,
        descriptorOrIndex?: TypedPropertyDescriptor<any> | number
    ): void => {
        // Class
        if(typeof target === "function" && typeof propertyKey === "undefined" && typeof descriptorOrIndex === "undefined") {
            Reflect.defineMetadata(DESCRIPTION_METADATA, description, target);
            return;
        }

        if(typeof target !== "object" || !propertyKey) {
            return;
        }

        // Property
        if(typeof descriptorOrIndex === "undefined") {
            Reflect.defineMetadata(DESCRIPTION_METADATA, description, target, propertyKey);
            return;
        }

        // Method
        if(typeof descriptorOrIndex !== "number") {
            Reflect.defineMetadata(DESCRIPTION_METADATA, description, descriptorOrIndex.value);
            return;
        }

        // Parameter
        const {
            [descriptorOrIndex]: options,
            ...rest
        } = Reflect.getMetadata(ARGS_METADATA, target.constructor, propertyKey) || {};

        Reflect.defineMetadata(ARGS_METADATA, {
            ...rest,
            [descriptorOrIndex]: {
                ...options || {},
                description
            }
        }, target.constructor, propertyKey);

        Reflect.defineMetadata(DESCRIPTION_METADATA, {
            ...Reflect.getMetadata(DESCRIPTION_METADATA, target.constructor, propertyKey) || {},
            [descriptorOrIndex]: description
        }, target.constructor, propertyKey);
    };
};
