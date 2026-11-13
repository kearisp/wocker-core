export type Layer<D> = {
    name: string;
    priority: number;
    data: D;
};

export type ResolveRule<T = any> = {
    apply(values: T[]): T | undefined;
    empty?(): T;
};

type KeysOfUnion<T> = T extends unknown ? keyof T : never;

export type Rules<D> = {
    [K in KeysOfUnion<D>]-?: ResolveRule;
};

const isDefined = (value: unknown): boolean => {
    return value !== undefined && value !== null;
};

export const first = <T>(): ResolveRule<T> => ({
    apply: (values) => values[0]
});

export const merge = <T extends object>(): ResolveRule<T> => ({
    apply: (values) => {
        if(values.length === 0) {
            return undefined;
        }

        return Object.assign({}, ...[...values].reverse());
    },
    empty: () => ({} as T)
});

export const concat = <T>(options: {by?: (item: T) => unknown} = {}): ResolveRule<T[]> => ({
    apply: (values) => {
        if(values.length === 0) {
            return undefined;
        }

        const {by} = options;

        return [...values].reverse().reduce<T[]>((result, items) => {
            if(!by) {
                return [...result, ...items];
            }

            const keys = new Set(items.map(by));

            return [
                ...result.filter((item) => !keys.has(by(item))),
                ...items
            ];
        }, []);
    },
    empty: () => []
});

export const record = <T extends object>(rules: Rules<T>): ResolveRule<Record<string, T>> => ({
    apply: (values) => {
        if(values.length === 0) {
            return undefined;
        }

        const names = new Set(values.flatMap((value) => Object.keys(value)).reverse());
        const result: Record<string, T> = {};

        for(const name of names) {
            result[name] = resolveObject(rules, values.map((value) => value[name]).filter(isDefined));
        }

        return result;
    },
    empty: () => ({})
});

export const resolveObject = <D>(rules: Rules<D>, sources: D[]): D => {
    const result: Record<string, any> = {};
    const ruleMap = rules as Record<string, ResolveRule>;

    for(const key of Object.keys(ruleMap)) {
        const values = sources.map((source) => (source as Record<string, any>)[key]).filter(isDefined);
        const value = ruleMap[key].apply(values);

        if(value !== undefined) {
            result[key] = value;
        }
    }

    return result as D;
};

export class LayerResolver<D, L extends D = D> {
    protected readonly _layers: Layer<L>[];

    public constructor(
        protected readonly rules: Rules<D>,
        layers: Layer<L>[]
    ) {
        this._layers = [...layers].sort((a, b) => a.priority - b.priority);
    }

    public get layers(): Layer<L>[] {
        return this._layers;
    }

    public layer(name: string): Layer<L> | undefined {
        return this._layers.find((l) => l.name === name);
    }

    public origin(path: keyof D | string[]): string | undefined {
        const segments = Array.isArray(path) ? path : [path as string];

        for(const layer of this._layers) {
            let value: any = layer.data;

            for(const segment of segments) {
                if(value === null || typeof value !== "object") {
                    value = undefined;
                    break;
                }

                value = value[segment];
            }

            if(isDefined(value)) {
                return layer.name;
            }
        }

        return undefined;
    }

    public resolve<K extends keyof D>(path: K | [K]): D[K];
    public resolve<K extends keyof D, K2 extends keyof NonNullable<D[K]>>(path: [K, K2]): NonNullable<D[K]>[K2];
    public resolve<
        K extends keyof D,
        K2 extends keyof NonNullable<D[K]>,
        K3 extends keyof NonNullable<NonNullable<D[K]>[K2]>
    >(path: [K, K2, K3]): NonNullable<NonNullable<D[K]>[K2]>[K3];
    public resolve(path: string[]): any;
    public resolve(path: string | string[]): any {
        const [field, ...rest] = Array.isArray(path) ? path : [path];
        const rule = (this.rules as Record<string, ResolveRule>)[field];
        const values = this._layers.map((layer) => (layer.data as Record<string, any>)[field]).filter(isDefined);

        let value = rule.apply(values) ?? rule.empty?.();

        for(const segment of rest) {
            if(value === null || typeof value !== "object") {
                return undefined;
            }

            value = value[segment];
        }

        return value;
    }
}
