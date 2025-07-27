import {describe, it, expect} from "@jest/globals";
import "reflect-metadata";
import {Optional} from "./Optional";
import {ARGS_METADATA} from "../env";


describe("Optional", (): void => {
    it("should add metadata", (): void => {
        class TestClass {
            public constructor(
                @Optional()
                _optional?: string
            ) {}

            public testMethod(
                @Optional()
                _optional?: string
            ) {}
        }

        expect(Reflect.getMetadata(ARGS_METADATA, TestClass)).toEqual({
            "0": {
                optional: true
            }
        });

        expect(Reflect.getMetadata(ARGS_METADATA, TestClass, "testMethod")).toEqual({
            "0": {
                optional: true
            }
        });
    });
});
