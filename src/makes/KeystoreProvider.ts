export abstract class KeystoreProvider {
    public abstract get(key: string, defaultValue: string): Promise<string>;
    public abstract get(key: string, defaultValue?: string): Promise<string|undefined>;
    public abstract set(key: string, value: string): Promise<void>;
    public abstract delete(key: string): Promise<void>;
}
