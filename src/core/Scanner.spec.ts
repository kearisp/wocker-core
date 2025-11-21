import {describe, it, expect} from "@jest/globals";
import "reflect-metadata";
import {Module, Injectable, Global, Controller, Command, Completion, Param, Inject, Optional} from "../decorators";
import {DynamicModule} from "../types";
import {Scanner} from "./Scanner";
import {Container} from "./Container";


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
            public static register(): DynamicModule {
                return {
                    module: ParentModule,
                    imports: [ChildModule]
                };
            }
        }

        const scanner = new Scanner();

        await scanner.scan(ParentModule.register());

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
                _name?: string
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

        const parentModule = scanner.container.getModule(ParentModule),
              childService = parentModule.get(ChildService);

        expect(childService).toBeInstanceOf(ChildService);
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

    it("should provide access from global module", async (): Promise<void> => {
        const TEST_VALUE = "test-value";

        @Injectable("GLOBAL_SERVICE")
        abstract class BaseGlobalService {
            public abstract getValue(): string;
        }

        @Injectable("GLOBAL_SERVICE")
        class GlobalService extends BaseGlobalService {
            public getValue(): string {
                return TEST_VALUE;
            }
        }

        @Injectable()
        class ChildService {
            public constructor(
                protected readonly globalService: BaseGlobalService
            ) {}
        }

        @Module({
            providers: [
                ChildService
            ]
        })
        class ChildModule {}

        @Global()
        @Module({
            imports: [ChildModule],
            providers: [
                GlobalService
            ],
            exports: [
                GlobalService
            ]
        })
        class ParentModule {}

        const scanner = new Scanner();

        await scanner.scan(ParentModule);

        const childModule = scanner.container.getModule(ChildModule),
              globalService = childModule.get(GlobalService);

        expect(globalService).toBeInstanceOf(GlobalService);
        expect(globalService.getValue()).toBe(TEST_VALUE);
    });

    it("should process optional service", async (): Promise<void> => {
        class TestRequiredService {}

        class TestOptionalService {}

        @Injectable()
        class Test1Service {
            public constructor(
                public readonly testRequiredService: TestRequiredService,
                @Optional()
                public readonly testOptionalService?: TestOptionalService,
            ) {}
        }

        @Module({
            providers: [
                Test1Service,
                TestRequiredService
            ]
        })
        class TestModule {}

        const scanner = new Scanner();

        await scanner.scan(TestModule);

        const test1Service = scanner.container.getModule(TestModule).get(Test1Service, true);

        expect(test1Service).toBeInstanceOf(Test1Service);
        expect(test1Service?.testRequiredService).toBeInstanceOf(TestRequiredService);
        expect(test1Service?.testOptionalService).toBeUndefined();
    });

    it("should scan async module", async (): Promise<void> => {
        @Module({
            providers: [
                {
                    provide: "TEST_1",
                    useValue: "Value 1"
                }
            ],
            exports: [
                "TEST_1"
            ]
        })
        class TestModule {
            public static registerAsync(): DynamicModule {
                return {
                    module: TestModule,
                    providers: [
                        {
                            provide: "TEST_2",
                            useValue: "Value 2"
                        }
                    ],
                    exports: ["TEST_2"],
                    inject: [ParentConfigService],
                    useFactory: (parentService: ParentConfigService) => {
                        return {
                            providers: [
                                {
                                    provide: "TEST_3",
                                    useValue: parentService.getTest3()
                                }
                            ],
                            exports: ["TEST_3"]
                        };
                    }
                };
            }
        }

        class ParentConfigService {
            public getTest3(): string {
                return "Value 3";
            }
        }

        @Injectable()
        class ParentService {
            public constructor(
                @Inject("TEST_1")
                public readonly test1: string,
                @Inject("TEST_2")
                public readonly test2: string,
                @Inject("TEST_3")
                public readonly test3: string
            ) {
            }
        }

        @Global()
        @Module({
            imports: [
                TestModule.registerAsync()
            ],
            providers: [
                ParentService,
                ParentConfigService
            ],
            exports: [
                ParentConfigService
            ]
        })
        class TestParentModule {}

        const scanner = new Scanner();

        await scanner.scan(TestParentModule);

        const testParentModule = scanner.container.getModule(TestParentModule),
              parentService = testParentModule.get(ParentService);

        expect(parentService).toBeInstanceOf(ParentService);
        expect(parentService.test1).toBe("Value 1");
        expect(parentService.test2).toBe("Value 2");
        expect(parentService.test3).toBe("Value 3");
    });

    it("should scan submodules", async (): Promise<void> => {
        @Injectable("TEST_SUBMODULE_PROVIDER")
        class TestSubModuleService {
            public getValue(): string {
                return "TestValue";
            }
        }

        @Module({
            providers: [TestSubModuleService],
            exports: [TestSubModuleService]
        })
        class TestSubModule {}

        @Injectable("TEST_MODULE_SERVICE")
        class TestTopModuleService {
            public constructor(
                protected readonly testSubmoduleService: TestSubModuleService
            ) {}

            public getValue() {
                return this.testSubmoduleService.getValue();
            }
        }

        @Module({
            imports: [TestSubModule],
            providers: [TestTopModuleService],
            exports: [TestTopModuleService]
        })
        class TestTopModule {}

        const container = new Container(),
              scanner = new Scanner(container);

        await scanner.scan(TestTopModule);

        const testTopModule = container.getModule(TestTopModule),
              testTopModuleService = testTopModule.get(TestTopModuleService);

        expect(testTopModuleService).toBeInstanceOf(TestTopModuleService);
        expect(testTopModuleService.getValue()).toBe("TestValue");
    });
});
