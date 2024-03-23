import {InjectionToken} from "./InjectionToken";
import {Type} from "./Type";


export type Provider<T = any> =
    | Type<T>
    | ClassProvider<T>
    | ValueProvider<T>;

type ClassProvider<T = any> = {
    provide: InjectionToken;
    useClass: Type<T>;
};

type ValueProvider<T = any> = {
    provide: InjectionToken;
    useValue: T;
};
