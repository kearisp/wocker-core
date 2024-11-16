import "reflect-metadata";
import {Cli, CommandInput} from "@kearisp/cli";

import {Provider} from "../types/Provider";
import {Container} from "./Container";
import {InstanceWrapper} from "./InstanceWrapper";
import {Module} from "./Module";
import {
    ARGS_METADATA,
    COMMAND_DESCRIPTION_METADATA,
    COMMAND_METADATA,
    COMPLETION_METADATA,
    IS_GLOBAL_METADATA,
    MODULE_METADATA,
    PARAMTYPES_METADATA
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

                this.scanControllerRoutes(cli, type, controller)
            }
        }
    }

    protected scanControllerRoutes(cli: Cli, controller: any, wrapper: InstanceWrapper) {
        const controllerCommandNames: string[] = [];

        for(const name of Object.getOwnPropertyNames(controller.prototype)) {
            const descriptor = Object.getOwnPropertyDescriptor(controller.prototype, name);

            if(!descriptor) {
                continue;
            }

            const commandNames: string[] = Reflect.getMetadata(COMMAND_METADATA, descriptor.value) || [];

            if(commandNames.length === 0) {
                continue;
            }

            const argsMeta = Reflect.getMetadata(ARGS_METADATA, controller, name) || [];
            const designTypes = Reflect.getMetadata(PARAMTYPES_METADATA, controller.prototype, name) || [];
            const description = Reflect.getMetadata(COMMAND_DESCRIPTION_METADATA, descriptor.value);

            for(const commandName of commandNames) {
                controllerCommandNames.push(commandName);

                const command = cli.command(commandName);

                if(description) {
                    command.help({
                        description
                    });
                }

                argsMeta.forEach((argMeta: any) => {
                    if(argMeta.type === "option") {
                        command.option(argMeta.name, argMeta.params);
                    }
                });

                command.action((input: CommandInput) => {
                    const args: any[] = [];
                    const params = Object.values(input.arguments());

                    argsMeta.forEach((argMeta: any) => {
                        switch(argMeta.type) {
                            case "param":
                                args[argMeta.index] = input.argument(argMeta.name)
                                break;

                            case "option":
                                if(designTypes[argMeta.index] === Array) {
                                    args[argMeta.index] = input.options(argMeta.name);
                                }
                                else {
                                    args[argMeta.index] = input.option(argMeta.name);
                                }
                                break;
                        }
                    });

                    return wrapper.instance[name](...args, ...params);
                });
            }
        }

        const controllerCompletions: {name: string; method: string; command: string;}[] = [];

        for(const method of Object.getOwnPropertyNames(controller.prototype)) {
            const descriptor = Object.getOwnPropertyDescriptor(controller.prototype, method);

            if(!descriptor) {
                continue;
            }

            const completions = Reflect.getMetadata(COMPLETION_METADATA, descriptor.value) || [];

            if(completions.length === 0) {
                continue;
            }

            for(const completion of completions) {
                controllerCompletions.push({
                    ...completion,
                    method
                });
            }
        }

        controllerCompletions.sort((a, b) => {
            return a.command < b.command ? -1 : 1;
        });

        for(const completion of controllerCompletions) {
            const commandNames = completion.command
                ? [completion.command]
                : controllerCommandNames.filter((commandName) => {
                    return !controllerCompletions.filter((c) => {
                        return c.name === completion.name && typeof c.command !== "undefined";
                    }).map((c) => {
                        return c.method;
                    }).includes(commandName);
                });

            const argsMeta = Reflect.getMetadata(ARGS_METADATA, controller, completion.method) || [];
            const designTypes = Reflect.getMetadata(PARAMTYPES_METADATA, controller.prototype, completion.method) || [];

            for(const commandName of commandNames) {
                cli.command(commandName).completion(completion.name, (input: CommandInput) => {
                    const args: any[] = [];

                    argsMeta.forEach((argMeta: any) => {
                        switch(argMeta.type) {
                            case "param":
                                args[argMeta.index] = input.argument(argMeta.name)
                                break;

                            case "option":
                                if(designTypes[argMeta.index] === Array) {
                                    args[argMeta.index] = input.options(argMeta.name);
                                }
                                else {
                                    args[argMeta.index] = input.option(argMeta.name);
                                }
                                break;
                        }
                    });

                    return wrapper.instance[completion.method](...args);
                });
            }
        }

        return true;
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
