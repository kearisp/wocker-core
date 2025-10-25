import {describe, it, expect, jest} from "@jest/globals";
import {Module} from "../decorators";
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

    it("", async () => {
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
});
