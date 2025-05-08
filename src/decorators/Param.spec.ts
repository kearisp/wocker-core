import {describe, it, expect} from "@jest/globals";
import "reflect-metadata";
import {Param} from "./Param";
import {ARGS_METADATA} from "../env";


describe("Param", () => {
    it("should set parameter metadata for decorated method parameter", () => {
        class TestClass {
            public testMethod(
                @Param("test")
                testParam: any
            ) {}
        }

        expect(Reflect.getMetadata(ARGS_METADATA, TestClass, "testMethod")).toEqual([
            {
                type: "param",
                name: "test",
                index: 0
            }
        ]);
    });

    it("should not throw when decorator is called with invalid parameters", () => {
        expect(() => Param("test2")({}, undefined, 1)).not.toThrow();
    });
});
