import {it, expect} from "@jest/globals";
import "reflect-metadata";
import {Option} from "./Option";
import {ARGS_METADATA} from "../env";


it("Option", (): void => {
    class TestClass {
        public constructor(
            @Option("value", "v")
            _value: string
        ) {}

        public testMethod(
            @Option("value", "v")
            _value: string
        ): void {}
    }

    const argsMeta = Reflect.getMetadata(ARGS_METADATA, TestClass, "testMethod") || [];

    const argMeta = argsMeta.find((argMeta: any) => {
        return argMeta.name === "value";
    });

    expect(argMeta).not.toBeNull();
});
