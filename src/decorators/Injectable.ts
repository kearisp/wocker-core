import {
    INJECTABLE_WATERMARK,
    INJECT_TOKEN_METADATA
} from "../env";


type Options = string | {
    token?: string;
};

export const Injectable = (tokenOrOptions?: Options): ClassDecorator => {
    return (target: object): void => {
        Reflect.defineMetadata(INJECTABLE_WATERMARK, true, target);

        if(!tokenOrOptions) {
            return;
        }

        const {
            token
        } = typeof tokenOrOptions === "string" ? {token: tokenOrOptions} : tokenOrOptions;

        if(token) {
            Reflect.defineMetadata(INJECT_TOKEN_METADATA, token, target);
        }
    };
};
