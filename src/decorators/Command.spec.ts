import {expect, it} from "@jest/globals";

import {COMMAND_METADATA} from "../env";
import {Command} from "./Command";


it("Completion", () => {
    const argName = "test";

    class TestClass {
        @Command(argName)
        public testMethod(): string[] {
            return [];
        }
    }

    const descriptor = Object.getOwnPropertyDescriptor(TestClass.prototype, "testMethod");

    const command = descriptor
        ? Reflect.getMetadata(COMMAND_METADATA, descriptor.value)
        : null;

    expect(command).toEqual([argName]);
});
