import {expect, it} from "@jest/globals";

import {COMPLETION_METADATA} from "../env";
import {Completion} from "./Completion";


it("Completion", () => {
    const argName = "test";

    class TestClass {
        @Completion(argName)
        public testMethod(): string[] {
            return [];
        }
    }

    const descriptor = Object.getOwnPropertyDescriptor(TestClass.prototype, "testMethod");

    const completion = descriptor
        ? Reflect.getMetadata(COMPLETION_METADATA, descriptor.value)
        : null;

    expect(completion).toEqual([{name: argName}]);
});
