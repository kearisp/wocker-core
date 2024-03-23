import {
    INJECTABLE_WATERMARK,
    INJECT_TOKEN_METADATA
} from "../env";


export const Injectable = (token?: string): ClassDecorator => {
    return (target: object): void => {
        Reflect.defineMetadata(INJECTABLE_WATERMARK, true, target);

        if(token) {
            Reflect.defineMetadata(INJECT_TOKEN_METADATA, token, target);
        }
    };
};
