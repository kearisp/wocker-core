import {Injectable} from "../decorators";


export type AppEventHandle = (...args: any[]) => Promise<void>|void;

@Injectable("APP_EVENTS_SERVICE")
export abstract class AppEventsService {
    public abstract on(event: string, handle: AppEventHandle): void;
    public abstract off(event: string, handle: AppEventHandle): void;
    public abstract emit(event: string, ...args: any[]): Promise<void>;
}
