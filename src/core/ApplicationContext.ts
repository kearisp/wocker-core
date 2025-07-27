import {Cli} from "@kearisp/cli";
import {Type} from "../types";
import {Container} from "./Container";
import {AsyncStorage} from "./AsyncStorage";


export class ApplicationContext {
    public constructor(
        protected readonly module: any,
        protected readonly container: Container
    ) {}

    public get<TInput = any, TResult = TInput>(typeOrToken: Type<TInput> | Function | string | symbol): TResult {
        const module = this.container.getModule(this.module);

        if(!module) {
            throw new Error("Module not found");
        }

        const res = module.get<TInput, TResult>(typeOrToken);

        if(!res) {
            throw new Error("Instance not found");
        }

        return res;
    }

    public async run(args: string[]): Promise<string> {
        return new Promise((resolve) => {
            AsyncStorage.run(this.container, () => {
                const cli = this.get(Cli);

                cli.command("").action(() => {
                    for(const [, module] of this.container.modules) {
                        for(const [, container] of module.controllers) {
                            if(!container.description) {
                                continue;
                            }

                            console.info(`${container.description}:`);

                            const spaceLength = container.commands.reduce((space, route) => {
                                return route.commandNames.reduce((space, command) => {
                                    return Math.max(space, command.length + 2);
                                }, space);
                            }, 0);

                            for(const route of container.commands) {
                                if(!route.description) {
                                    continue;
                                }

                                for(const commandName of route.commandNames) {
                                    const space = " ".repeat(Math.max(0, spaceLength - commandName.length));

                                    console.info(`  ${commandName} ${space} ${route.description}`);
                                }
                            }

                            console.info("");
                        }
                    }
                });

                return resolve(cli.run(args));
            });
        });
    }
}
