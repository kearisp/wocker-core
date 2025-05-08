import {Injectable} from "../decorators";
import {KeystoreProvider} from "../makes";


@Injectable("KEYSTORE_SERVICE")
export abstract class KeystoreService {
    public abstract hasProvider(name: string): boolean;
    public abstract provider(name?: string): KeystoreProvider;
    public abstract get(key: string, defaultValue: string): Promise<string>;
    public abstract get(key: string, defaultValue?: string): Promise<string | undefined>;
    public abstract set(key: string, value: string): Promise<void>;
    public abstract registerProvider(name: string, provider: KeystoreProvider): void;
}
