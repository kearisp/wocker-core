import {it, expect, describe} from "@jest/globals";
import "reflect-metadata";
import {Option} from "./Option";
import {
    ARGS_METADATA,
    ARGS_METADATA_OLD
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
            },
            index: 0
        });

        const argsMetaOld = Reflect.getMetadata(ARGS_METADATA_OLD, TestClass, "testMethod") || [];

        const argMetaOld = argsMetaOld.find((argMeta: any) => {
            return argMeta.name === "value";
        });

        expect(argMetaOld).not.toBeNull();
    });
});
