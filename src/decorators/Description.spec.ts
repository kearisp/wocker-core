import {describe, expect, it} from "@jest/globals";
import "reflect-metadata";
import {DESCRIPTION_METADATA} from "../env";
import {Description} from "./Description";


describe("Description", (): void => {
    const getClassMetadata = (target: any, property?: string | symbol) => {
        if(property) {
            return Reflect.getMetadata(DESCRIPTION_METADATA, target.prototype, property);
        }

        return Reflect.getMetadata(DESCRIPTION_METADATA, target);
    };

    const getMethodMetadata = (target: any, property: string | symbol) => {
        const descriptor = Object.getOwnPropertyDescriptor(target.prototype, property);

        if(!descriptor) {
            return "";
        }

        return Reflect.getMetadata(DESCRIPTION_METADATA, descriptor.value);
    };

    const getArgsMetadata = (target: any, property: string | symbol) => {
        return Reflect.getMetadata(DESCRIPTION_METADATA, target, property);
    };

    it("should apply to class", (): void => {
        const testDescription = "Test Class Description";

        @Description(testDescription)
        class TestClass {}

        expect(getClassMetadata(TestClass)).toBe(testDescription);
    });

    it("should apply to method", (): void => {
        const testDescription = "Test Method Description";

        class TestClass {
            @Description(testDescription)
            testMethod(): void {}
        }

        expect(getMethodMetadata(TestClass, "testMethod")).toBe(testDescription);
    });

    it("should apply to property", (): void => {
        const testDescription = "Test Property Description";

        class TestClass {
            @Description(testDescription)
            testProperty: string = "test";
        }

        expect(getClassMetadata(TestClass, "testProperty")).toBe(testDescription);
    });

    it("should apply to method parameter", (): void => {
        const testDescription = "Test Parameter Description",
              test2Description = "Test Second Parameter Description";

        class TestClass {
            testMethod(
                @Description(testDescription)
                param: string,
                @Description(test2Description)
                second: string
            ): void {}
        }

        expect(getArgsMetadata(TestClass, "testMethod")).toEqual({
            0: testDescription,
            1: test2Description
        });
    });

    it("should work with all types in the same class", (): void => {
        const classDesc = "Class Description";
        const propDesc = "Property Description";
        const methodDesc = "Method Description";
        const paramDesc = "Parameter Description";

        @Description(classDesc)
        class ComplexTestClass {
            @Description(propDesc)
            testProp: string = "test";

            @Description(methodDesc)
            testMethod(
                @Description(paramDesc)
                param: string
            ): void {}
        }

        // Class
        expect(getClassMetadata(ComplexTestClass)).toBe(classDesc);

        // Property
        expect(getClassMetadata(ComplexTestClass, "testProp")).toBe(propDesc);

        // Method
        expect(getMethodMetadata(ComplexTestClass, "testMethod")).toEqual(methodDesc);

        // Parameter
        expect(getArgsMetadata(ComplexTestClass, "testMethod")).toEqual({
            0: paramDesc
        });
    });

    it("should handle direct decorator function calls with invalid arguments", (): void => {
        const decorator = Description(undefined as any);
        // @ts-expect-error
        expect(() => decorator({} as any, undefined, undefined)).not.toThrow();
    });
});
