type Params = {
    command?: string;
};

export const Controller = (params?: Params): ClassDecorator => {
    const {
        command
    } = params || {};

    return (target) => {
        if(!command) {
            return;
        }

        Reflect.defineMetadata("IS_CONTROLLER", true, target);

        // TODO:
    };
};
