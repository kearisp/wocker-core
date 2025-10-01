import {describe, it, expect} from "@jest/globals";
import "reflect-metadata";
import {ProviderType} from "../types";
import {Injectable, Inject} from "../decorators";
import {Container} from "./Container";
import {ModuleWrapper} from "./ModuleWrapper";


describe("ModuleWrapper", (): void => {
    class ModuleType {}

    it("Should be provider", (): void => {
        const TestValueProvider: ProviderType = {
            provide: "TEST_PROVIDER",
            useValue: "Value"
        };

        @Injectable()
        class TestClassProvider {
            public name = "TEST_SERVICE_NAME";

            public constructor(
                @Inject("TEST_PROVIDER")
                public providedValue: string
            ) {}
        }

        class ExceptionTestService {}

        const container = new Container();
        const module = new ModuleWrapper(container, ModuleType);

        module.addProvider(TestClassProvider);
        module.addProvider(TestValueProvider);

        const testClass = module.get<TestClassProvider>(TestClassProvider);

        const testValue = module.get(TestValueProvider.provide);

        expect(testClass).toBeDefined();
        expect(testClass).toBeInstanceOf(TestClassProvider);
        expect(testClass.name).toBe("TEST_SERVICE_NAME");
        expect(testClass.providedValue).toBe(TestValueProvider.useValue);
        expect(testValue).toBe(TestValueProvider.useValue);

        expect(() => {
            module.get(ExceptionTestService);
        }).toThrow();
    });
});
