/**
 * @deprecated
 */
export type ConfigProperties = {
    name: string;
};

/**
 * @deprecated
 */
/* istanbul ignore next */
export class Config<T extends ConfigProperties> {
    public name: string;

    public constructor(data: T) {
        this.name = data.name;
    }

    public toObject(): T {
        return Object.keys(this)
            .reduce<T>((res: T, key: string) => {
                (res as any)[key] = (this as any)[key];

                return res;
            }, {} as T);
    }
}
