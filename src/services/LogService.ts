import {Injectable} from "../decorators";


@Injectable("LOG_SERVICE")
export abstract class LogService {
    public abstract debug(...data: any[]): void;
    public abstract log(...data: any[]): void;
    public abstract info(...data: any[]): void;
    public abstract warn(...data: any[]): void;
    public abstract error(...data: any[]): void;
}
