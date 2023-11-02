type EventHandle = (...args: any[]) => Promise<void>|void;


abstract class AppEventsService {
    public abstract on(event: string, handle: EventHandle): void;
    public abstract off(event: string, handle: EventHandle): void;
    public abstract emit(event: string, ...args: any[]): Promise<void>;
}


export {
    AppEventsService,
    EventHandle as AppEventHandle
};
