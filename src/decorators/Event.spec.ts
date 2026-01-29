import {describe, it, expect} from "@jest/globals";
import "reflect-metadata";
import {Event} from "./Event";
import {Controller} from "./Controller";
import {IS_CONTROLLER_METADATA, LISTENER_METADATA} from "../env";


describe("Event", (): void => {
    it("should add metadata when used with @Controller", (): void => {
        @Controller()
        class TestController {
            @Event("test.event")
            public testMethod() {}
        }

        const controller = new TestController();

        expect(Reflect.getMetadata(LISTENER_METADATA, controller.testMethod)).toEqual(["test.event"]);
    });

    it("should throw error when used without @Controller", (): void => {
        expect(() => {
            class TestClass {
                @Event("test.event")
                public testMethod() {}
            }
            new TestClass();
        }).toThrow("@Event can only be used in classes decorated with @Controller. Class: TestClass");
    });

    it("should support multiple @Event decorators on the same method", (): void => {
        @Controller()
        class TestController {
            @Event("event.one")
            @Event("event.two")
            public testMethod() {}
        }

        const controller = new TestController();
        expect(Reflect.getMetadata(LISTENER_METADATA, controller.testMethod)).toEqual(["event.two", "event.one"]);
    });
});
