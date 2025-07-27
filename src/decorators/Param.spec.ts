import {describe, it, expect} from "@jest/globals";
import "reflect-metadata";
import {Param} from "./Param";
import {ARGS_METADATA, ARGS_METADATA_OLD} from "../env";


describe("Param", (): void => {
    it("should set parameter metadata for decorated method parameter", (): void => {
        class TestClass {
            public testMethod(
                @Param("test")
                testParam: any
            ) {}
        }

        expect(Reflect.getMetadata(ARGS_METADATA, TestClass, "testMethod")).toEqual({
            "0": {
                type: "param",
                name: "test",
                index: 0
            }
        });

        expect(Reflect.getMetadata(ARGS_METADATA_OLD, TestClass, "testMethod")).toEqual([
            {
                type: "param",
                name: "test",
                index: 0
            }
        ]);
    });

    it("should not throw when decorator is called with invalid parameters", (): void => {
        expect(() => Param("test2")({}, undefined, 1)).not.toThrow();
    });
});
