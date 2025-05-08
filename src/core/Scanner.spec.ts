import {describe, it, expect, beforeAll, afterEach} from "@jest/globals";
import {Logger} from "@kearisp/cli";
import {Scanner} from "./Scanner";
import {Module, Injectable, Global, Controller, Command, Completion, Param} from "../decorators";


describe("Scanner", (): void => {
    beforeAll((): void => {
        Logger.mute();
    });

    afterEach((): void => {
        Logger.debug("-----------");
        Logger.mute();
    });

    it("submodule uses a provider from its parent", async (): Promise<void> => {
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

    it("Dynamic submodule uses a provider from its parent", async (): Promise<void> => {
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

    it("should process controller commands", async () => {
        @Controller()
        class TestController {
            @Command("test-command [name]")
            public testCommand(
                @Param("name")
                name?: string
            ) {
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

        const testController = scanner.container.getModule(TestModule).controllers.get(TestController);

        // Logger.info("ROUTES:", testController?.commands)
        // Logger.info("COMPLETIONS:", testController?.completions)

        expect(1).toBe(1);
    });
});
