import {describe, it, expect, jest} from "@jest/globals";
import {Module, Controller, Event} from "../decorators";
import {EventService, EventHandle} from "./EventService";
import {Factory} from "../core";


describe("EventService", (): void => {
    const getContext = async () => {
        @Module({
            providers: [
                EventService
            ]
        })
        class TestModule {}

        const context = await Factory.create(TestModule);

        return {
            eventService: context.get(EventService)
        };
    };

    it("should emit event and call listener", async () => {
        const {eventService} = await getContext();

        const listener = jest.fn();

        eventService.on("test", listener as EventHandle);
        await eventService.emit("test", 1, 2, 3);

        expect(listener).toHaveBeenCalled();
        expect(listener).toHaveBeenCalledWith(1, 2, 3);
    });

    it("should unsubscribe from event", async () => {
        const {eventService} = await getContext();

        const listener1 = jest.fn(),
              listener2 = jest.fn();

        const cancel1 = eventService.on("test", listener1 as EventHandle);
        eventService.on("test", listener2 as EventHandle);

        cancel1();
        eventService.off("test", listener2 as EventHandle);

        await eventService.emit("test");

        expect(listener1).not.toHaveBeenCalled();
        expect(listener2).not.toHaveBeenCalled();
    });

    it("should emit decorated method", async () => {
        const onTest = jest.fn();

        @Controller()
        class TestListener {
            @Event("test")
            public onTest(a: string, b: string) {
                onTest(a, b);
            }
        }

        @Module({
            controllers: [TestListener]
        })
        class TestModule {}

        const context = await Factory.create(TestModule);

        const eventService = context.get(EventService);

        await eventService.emit("test", "foo", "bar");

        expect(onTest).toHaveBeenCalledWith("foo", "bar");
    });
});
