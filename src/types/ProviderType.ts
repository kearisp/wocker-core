import {InjectionToken} from "./InjectionToken";
import {Type} from "./Type";


type ClassProvider<T = any> = {
    provide: InjectionToken;
    useClass: Type<T>;
};

type ValueProvider<T = any> = {
    provide: InjectionToken;
    useValue: T;
};

type FactoryProvider<T = any> = {
    provide: InjectionToken;
    useFactory: T | Promise<T>;
};

export type ProviderType<T = any> =
    | Type<T>
    | ClassProvider<T>
    | ValueProvider<T>;
