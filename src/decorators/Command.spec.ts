import {expect, it} from "@jest/globals";
import "reflect-metadata";
import {Command} from "./Command";
import {COMMAND_METADATA} from "../env";


it("Completion", (): void => {
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
