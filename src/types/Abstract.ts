export type Abstract<T> = Function & {
    prototype: T;
};
