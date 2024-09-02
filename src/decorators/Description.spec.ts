import {expect, it} from "@jest/globals";
import {COMMAND_DESCRIPTION_METADATA} from "../env";

import {Description} from "./Description";


it("Description", (): void => {
    const text = "Test method description";

    class TestClass {
        @Description(text)
        public testMethod(): void {}
    }

    const descriptor = Object.getOwnPropertyDescriptor(TestClass.prototype, "testMethod");

    const description = descriptor
        ? Reflect.getMetadata(COMMAND_DESCRIPTION_METADATA, descriptor.value)
        : null;

    expect(description).toEqual(text);
});
