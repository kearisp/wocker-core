export const Controller = (): ClassDecorator => {
    return (target) => {
        Reflect.defineMetadata("IS_CONTROLLER", true, target);
    };
};
