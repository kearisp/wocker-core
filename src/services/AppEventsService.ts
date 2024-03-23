import {Injectable} from "../decorators";

type EventHandle = (...args: any[]) => Promise<void>|void;


@Injectable("APP_EVENTS_SERVICE")
export abstract class AppEventsService {
    public abstract on(event: string, handle: EventHandle): void;
    public abstract off(event: string, handle: EventHandle): void;
    public abstract emit(event: string, ...args: any[]): Promise<void>;
}


export {EventHandle as AppEventHandle};
