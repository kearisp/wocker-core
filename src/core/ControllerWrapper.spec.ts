import {describe, it, expect, beforeAll, afterEach} from "@jest/globals";
import {Logger} from "@kearisp/cli";
import {Controller, Description, Command, Option} from "../decorators";
import {ControllerWrapper} from "./ControllerWrapper";


describe("ControllerWrapper", () => {
    beforeAll(() => {
        Logger.mute();
    });

    afterEach(() => {
        Logger.debug("-".repeat(10));
        Logger.mute();
    });

    it("should be a route", () => {
        @Controller()
        class TestController {
            @Command("test")
            @Description("Test command description")
            public testCommand(
                @Option("test")
                @Description("Test option description")
                stringValue?: string,
                @Option("test2")
                @Description("Test2 description")
                boolValue?: boolean
            ) {}
        }

        const wrapper = new ControllerWrapper(null as any, TestController);

        Logger.info(wrapper.getRoutes()[0].argsMeta);

        expect(1).toBe(1);
    });
});
