import {it, expect, describe} from "@jest/globals";
import "reflect-metadata";
import {Option} from "./Option";
import {
    ARGS_METADATA,
    ARGS_OLD_METADATA
} from "../env";


describe("Option", (): void => {
    it("should create metadata", (): void => {
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

        const argsMeta = Reflect.getMetadata(ARGS_METADATA, TestClass, "testMethod");

        expect(argsMeta).toBeDefined();
        expect(argsMeta[0]).toBeDefined();
        expect(argsMeta[0]).toEqual({
            type: "option",
            name: "value",
            params: {
                alias: "v",
            }
        });

        const argsMetaOld = Reflect.getMetadata(ARGS_OLD_METADATA, TestClass, "testMethod") || [];

        const argMetaOld = argsMetaOld.find((argMeta: any) => {
            return argMeta.name === "value";
        });

        expect(argMetaOld).not.toBeNull();
    });
});
