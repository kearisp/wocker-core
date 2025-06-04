import {describe, it, expect} from "@jest/globals";
import "reflect-metadata";
import {Container} from "./Container";
import {Module} from "./Module";
import {Provider} from "../types/Provider";
import {Injectable, Inject} from "../decorators";


describe("Module", (): void => {
    class ModuleType {}

    it("Should be provider", (): void => {
        const TestValueProvider: Provider = {
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
        const module = new Module(container, ModuleType);

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
        }).toThrowError();
    });
});
