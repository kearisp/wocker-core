import {Abstract} from "./Abstract";
import {Type} from "./Type";


export type InjectionToken<T = any> =
    | string
    | symbol
    | Type<T>
    | Abstract<T>
    | Function;
