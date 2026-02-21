import {Injectable} from "../decorators";
// noinspection ES6PreferShortImport
import {Container} from "../core/Container";
import {LISTENER_METADATA} from "../env";


export type EventHandle = (...args: any[]) => Promise<void>|void;
export type EventOff = () => void;

@Injectable("APP_EVENTS_SERVICE")
export class EventService {
    protected scanned = false;
    protected handles: Record<string, Set<EventHandle>> = {};

    public constructor(
        protected readonly container: Container
    ) {}

    protected scanListeners(): void {
        if(this.scanned) {
            return;
        }

        for(const [, moduleWrapper] of this.container.modules) {
            for(const [, controllerWrapper] of moduleWrapper.controllers) {
                if(!controllerWrapper.instance) continue;

                const instance = controllerWrapper.instance;
                const prototype = Object.getPrototypeOf(instance);

                const methodNames = Object.getOwnPropertyNames(prototype).filter(
                    name => typeof prototype[name] === "function" && name !== "constructor"
                );

                for(const methodName of methodNames) {
                    const eventNames: string[] = Reflect.getMetadata(LISTENER_METADATA, prototype[methodName]);

                    if(eventNames) {
                        for(const eventName of eventNames) {
                            this.preOn(eventName, instance[methodName].bind(instance));
                        }
                    }
                }
            }
        }

        this.scanned = true;
    }

    public on(event: string, handle: EventHandle): EventOff {
        if(!this.handles[event]) {
            this.handles[event] = new Set();
        }

        this.handles[event].add(handle);

        return (): void => {
            this.off(event, handle);
        };
    }

    protected preOn(event: string, handle: EventHandle): EventOff {
        if(!this.handles[event]) {
            this.handles[event] = new Set();
        }

        this.handles[event] = new Set([
            handle,
            ...Array.from(this.handles[event])
        ]);

        return () => {
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
        this.scanListeners();

        if(!this.handles[event]) {
            return;
        }

        for(const handle of this.handles[event].values()) {
            await handle(...args);
        }
    }
}
