import {Injectable} from "../decorators";


export type EventHandle = (...args: any[]) => Promise<void>|void;

@Injectable("APP_EVENTS_SERVICE")
export class EventService {
    protected handles: {
        [event: string]: Set<EventHandle>;
    } = {};

    public on(event: string, handle: EventHandle): (() => void) {
        if(!this.handles[event]) {
            this.handles[event] = new Set();
        }

        this.handles[event].add(handle);

        return (): void => {
            this.off(event, handle);
        };
    }

    public off(event: string, handle: EventHandle): void {
        if(!this.handles[event]) {
            return;
        }

        this.handles[event].delete(handle);
    }

    public async emit(event: string, ...args: any[]): Promise<void> {
        if(!this.handles[event]) {
            return;
        }

        for(const handle of this.handles[event].values()) {
            await handle(...args);
        }
    }
}
