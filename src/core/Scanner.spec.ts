import {describe, it, expect, beforeAll, afterEach} from "@jest/globals";
import {Logger} from "@kearisp/cli";

import {Scanner} from "./Scanner";
import {Module, Injectable, Global} from "../decorators";


describe("Scanner", (): void => {
    beforeAll((): void => {
        Logger.mute();
    });

    afterEach((): void => {
        Logger.debug("-----------");
        Logger.mute();
    });

    it("Submodule uses a provider from its parent", async (): Promise<void> => {
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
});
