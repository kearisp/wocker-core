import "reflect-metadata";


export const Completion = (name: string, command?: string): MethodDecorator => {
    return (target, propertyKey, descriptor: TypedPropertyDescriptor<any>) => {
        Reflect.defineMetadata("completion", [
            ...Reflect.getMetadata("completion", descriptor.value) || [],
            {
                name,
                command
            }
        ], descriptor.value);
    };
};
