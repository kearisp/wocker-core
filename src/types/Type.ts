export type Type<T = any> = Function & {
    new (...args: any[]): T;
};
