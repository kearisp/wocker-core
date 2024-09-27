import "reflect-metadata";
import {Cli, CommandInput} from "@kearisp/cli";

import {Provider} from "../types/Provider";
import {Container} from "./Container";
import {Module} from "./Module";
import {
    ARGS_METADATA,
    COMMAND_DESCRIPTION_METADATA,
    COMMAND_METADATA,
    COMPLETION_METADATA,
    IS_GLOBAL_METADATA,
    MODULE_METADATA
} from "../env";


export class Scanner {
    public readonly container: Container

    public constructor() {
        this.container = new Container();
    }

    public async scan(moduleType: any): Promise<void> {
        this.scanModule(moduleType);
        await this.scanDynamicModules();
        this.scanRoutes();
    }

    protected scanModule(moduleType: any): Module {
        let module = this.container.hasModule(moduleType)
            ? this.container.getModule(moduleType)
            : null;

        if(!module) {
            module = new Module(this.container, moduleType);

            this.container.addModule(moduleType, module);

            this.scanImports(module);
            this.scanControllers(module);
            this.scanProviders(module);
            this.scanExports(module);
        }

        return module;
    }

    protected scanControllers(module: Module): void {
        const controllers = Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, module.type) || [];

        controllers.forEach((controller: any): void => {
            module.addController(controller);
        });
    }

    protected scanProviders(module: Module): void {
        const providers: Provider[] = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, module.type) || [];

        providers.forEach((provider: Provider): void => {
            module.addProvider(provider);
        });
    }

    protected scanImports(module: Module): void {
        const imports = Reflect.getMetadata(MODULE_METADATA.IMPORTS, module.type) || [];

        imports.forEach((importType: any): void => {
            const subModule = this.scanModule(importType);

            subModule.exports.forEach((type): void => {
                const provider = subModule.providers.get(type);

                if(!provider) {
                    return;
                }

                module.providers.set(type, provider);
            });
        });
    }

    protected scanExports(module: Module): void {
        const exports = Reflect.getMetadata(MODULE_METADATA.EXPORTS, module.type) || [];
        const isGlobal = Reflect.getMetadata(IS_GLOBAL_METADATA, module.type) || false;

        exports.forEach((type: any): void => {
            module.addExport(type);

            if(isGlobal) {
                const wrapper = module.getWrapper(type);

                if(wrapper) {
                    this.container.addProvider(type, wrapper);
                }
            }
        });
    }

    protected scanRoutes(): void {
        const cliWrapper = this.container.providers.get(Cli);

        if(!cliWrapper) {
            return;
        }

        const cli: Cli = cliWrapper.instance;

        for(const [, module] of this.container.modules) {
            for(const [type, controller] of module.controllers) {
                if(!controller.instance) {
                    continue;
                }

                const controllerCommands: any[] = [];
                const controllerCompletions: any[] = [];

                for(const name of Object.getOwnPropertyNames(type.prototype)) {
                    const descriptor = Object.getOwnPropertyDescriptor(type.prototype, name);

                    if(!descriptor) {
                        continue;
                    }

                    const description = Reflect.getMetadata(COMMAND_DESCRIPTION_METADATA, descriptor.value);
                    const commandName = Reflect.getMetadata(COMMAND_METADATA, descriptor.value);
                    const completions = (Reflect.getMetadata(COMPLETION_METADATA, descriptor.value) || [])
                        .map((completion: any) => {
                            return {
                                ...completion,
                                method: name
                            };
                        });

                    if(completions.length > 0) {
                        controllerCompletions.push(...completions);
                    }

                    if(commandName) {
                        controllerCommands.push({
                            command: commandName,
                            controller,
                            method: name,
                            argsMeta: Reflect.getMetadata(ARGS_METADATA, type, name) || []
                        });

                        const argsMeta = Reflect.getMetadata(ARGS_METADATA, type, name) || [];

                        const command = cli.command(commandName);

                        command.help({
                            description: description
                        });

                        for(const argMeta of argsMeta) {
                            if(argMeta.type === "option") {
                                command.option(argMeta.name, argMeta.params);
                            }
                        }

                        // command.action((options, ...params) => {
                        //     const args: any[] = [];
                        //
                        //     argsMeta.forEach((argMeta: any) => {
                        //         if(argMeta.type === "option") {
                        //             args[argMeta.index] = options[argMeta.name];
                        //         }
                        //     });
                        //
                        //     return controller.instance[name](...args, ...params);
                        // });
                    }
                }

                for(const controllerCommand of controllerCommands) {
                    const {
                        command: commandName,
                        method,
                        argsMeta
                    } = controllerCommand;

                    cli.command(commandName)
                        .action((input: CommandInput): any => {
                            const args: any[] = [];
                            const params = Object.values(input.arguments());

                            argsMeta.forEach((argMeta: any): void => {
                                if(argMeta.type === "param") {
                                    args[argMeta.index] = input.argument(argMeta.name);
                                }
                                else if(argMeta.type === "option") {
                                    args[argMeta.index] = input.option(argMeta.name);
                                }
                            });

                            return controller.instance[method](...args, ...params);
                        });
                }

                for(const controllerCompletion of controllerCompletions) {
                    const {
                        name,
                        command: commandName,
                        method
                    } = controllerCompletion;

                    if(!commandName) {
                        for(const route of controllerCommands) {
                            const {
                                command
                            } = route;

                            cli.command(command).completion(name, () => {
                                return controller.instance[method]();
                            });
                        }
                    }
                    else {
                        cli.command(commandName).completion(name, () => {
                            return controller.instance[method]();
                        });
                    }
                }
            }
        }
    }

    protected async scanDynamicModules(): Promise<void> {
        const promises = ([...this.container.modules.keys()]).map(async (type): Promise<void> => {
            if(!type.prototype.load) {
                return;
            }

            const parentModule = this.container.modules.get(type);

            const {
                [MODULE_METADATA.IMPORTS]: imports = []
            } = await type.prototype.load(this.container);

            for(const subModuleType of imports) {
                const module = this.scanModule(subModuleType);

                module.exports.forEach((type) => {
                    const provider = module.getWrapper(type);

                    if(!provider) {
                        // console.log(type, ">_<", provider);
                        return;
                    }

                    // @ts-ignore
                    parentModule.providers.set(type, provider);
                });
            }
        });

        await Promise.all(promises);
    }
}
