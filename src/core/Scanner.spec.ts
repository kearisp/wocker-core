import {describe, it, expect} from "@jest/globals";
import "reflect-metadata";
import {Scanner} from "./";
import {Module, Injectable, Global, Controller, Command, Completion, Param, Inject} from "../decorators";


describe("Scanner", (): void => {
    it("should allow child module to access parent module's provider", async (): Promise<void> => {
        const VALUE = "Value from test provider";

        @Injectable()
        class ParentProvider {
            public getValue(): string {
                return VALUE;
            }
        }

        @Injectable()
        class ChildProvider {
            public constructor(
                protected readonly parentProvider: ParentProvider
            ) {}

            public getValue(): string {
                return this.parentProvider.getValue();
            }
        }

        @Module({
            providers: [ChildProvider],
            exports: [ChildProvider]
        })
        class ChildModule {}

        @Global()
        @Module({
            providers: [ParentProvider],
            imports: [ChildModule],
            exports: [ParentProvider]
        })
        class ParentModule {}

        const scanner = new Scanner();

        await scanner.scan(ParentModule);

        const childModule = scanner.container.getModule(ChildModule);

        const value = childModule.get(ChildProvider).getValue();

        expect(value).toEqual(VALUE);
    });

    it("should allow dynamically loaded child module to access parent module's provider", async (): Promise<void> => {
        const VALUE = "Value from test provider";

        @Injectable()
        class ParentProvider {
            public getValue(): string {
                return VALUE;
            }
        }

        @Injectable()
        class ChildProvider {
            public constructor(
                protected readonly parentProvider: ParentProvider
            ) {}

            public getValue(): string {
                return this.parentProvider.getValue();
            }
        }

        @Module({
            providers: [ChildProvider],
            exports: [ChildProvider]
        })
        class ChildModule {}

        @Global()
        @Module({
            providers: [ParentProvider],
            exports: [ParentProvider]
        })
        class ParentModule {
            async load() {
                return {
                    imports: [ChildModule]
                };
            }
        }

        const scanner = new Scanner();

        await scanner.scan(ParentModule);

        const value = scanner.container
            .getModule(ChildModule)
            .get(ChildProvider)
            .getValue();

        expect(value).toEqual(VALUE);
    });

    it("should register command and completion decorators from controller", async (): Promise<void> => {
        @Controller()
        class TestController {
            @Command("test-command [name]")
            public testCommand(
                @Param("name")
                name?: string
            ): string {
                return "";
            }

            @Completion("name", "test-command [name]")
            public getNames(): string[] {
                return [];
            }
        }

        @Module({
            controllers: [TestController]
        })
        class TestModule {}

        const scanner = new Scanner();

        await scanner.scan(TestModule);

        const testModule = scanner.container.getModule(TestModule);

        expect(testModule.controllers.has(TestController)).toBeTruthy();
    });

    it("should allow parent module to get service from child module", async (): Promise<void> => {
        class ChildService {}

        @Module({
            providers: [
                ChildService
            ],
            exports: [
                ChildService
            ]
        })
        class ChildModule {}

        @Module({
            imports: [
                ChildModule
            ]
        })
        class ParentModule {}

        const scanner = new Scanner();
        await scanner.scan(ParentModule);

        const parentModule = scanner.container.getModule(ParentModule);

        expect(parentModule.providers.has(ChildService)).toBeTruthy();
    });

    it("should initialize empty module without any components", async (): Promise<void> => {
        class TestModule {}

        const scanner = new Scanner();
        await scanner.scan(TestModule);

        const testModule = scanner.container.getModule(TestModule);

        expect(testModule.controllers.size).toBe(0);
        expect(testModule.providers.size).toBe(0);
        expect(testModule.exports.size).toBe(0);
        expect(testModule.imports.size).toBe(0);
    });

    it("should link services across child modules", async (): Promise<void> => {
        const provider1 = "TEST",
              providedValue = "Provided value from module 1";

        @Injectable()
        class Child1Service {
            public constructor(
                @Inject(provider1)
                protected value: string
            ) {}

            public getResponse(): string {
                return this.value;
            }
        }

        @Module({
            providers: [
                Child1Service,
                {
                    provide: provider1,
                    useValue: providedValue
                }
            ],
            exports: [
                Child1Service,
                provider1
            ]
        })
        class ChildModule1 {}

        @Injectable()
        class Child2Service {
            public constructor(
                protected readonly child1Service: Child1Service,
                @Inject(provider1)
                protected readonly value: string
            ) {}

            public triggerService1(): string {
                return this.child1Service.getResponse();
            }

            public getProviderValue(): string {
                return this.value;
            }
        }

        @Module({
            providers: [
                Child2Service
            ],
            exports: [
                Child2Service
            ],
            imports: [
                ChildModule1
            ]
        })
        class ChildModule2 {}

        @Module({
            imports: [
                ChildModule1,
                ChildModule2
            ]
        })
        class ParentModule {}

        const scanner = new Scanner();
        await scanner.scan(ParentModule);

        const parentModule = scanner.container.getModule(ParentModule);

        const service1 = parentModule.get(Child1Service),
              service2 = parentModule.get(Child2Service);

        expect(service1).toBeInstanceOf(Child1Service);
        expect(service2).toBeInstanceOf(Child2Service);
        expect(service2.triggerService1()).toBe(providedValue);
        expect(service2.getProviderValue()).toBe(providedValue);
    });
});
