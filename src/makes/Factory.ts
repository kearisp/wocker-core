import {Cli, CommandInput} from "@kearisp/cli";
import {ApplicationContext} from "./ApplicationContext";

import {Container} from "./Container";
import {Module} from "./Module";
import {Provider} from "../types/Provider";
import {
    MODULE_METADATA,
    IS_MODULE_METADATA,
    COMMAND_METADATA,
    COMPLETION_METADATA,
    ARGS_METADATA
} from "../env";


export class Factory {
    private readonly cli: Cli;
    private readonly container: Container;
    private routes: any[] = [];

    private constructor() {
        this.container = new Container();
        this.cli = new Cli();
    }

    public async scan(moduleType: any): Promise<void> {
        if(this.container.modules.has(moduleType)) {
            return;
        }

        await this.scanModules(moduleType);
        await this.scanDependencies();
        await this.scanDynamicModules();
        await this.scanRoutes();
        await this.init();
    }

    public async scanModules(moduleType: any, parent?: Module) {
        if(this.container.hasModule(moduleType)) {
            return;
        }

        const module = new Module(moduleType, parent);

        this.container.addModule(moduleType, module);

        const modules = Reflect.getMetadata(MODULE_METADATA.IMPORTS, moduleType) || [];

        for(const subModuleType of modules) {
            await this.scanModules(subModuleType, module);
        }

        // const exports = Reflect.getMetadata(MODULE_METADATA.EXPORTS, moduleType) || [];

        return module;
    }

    public async scanDependencies() {
        for(const [, module] of this.container.modules) {
            await this.scanModuleDependencies(module);
        }
    }

    public async scanModuleDependencies(module: Module): Promise<void> {
        const providers: Provider[] = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, module.type) || [];

        // Logger.info(module.type.name, providers);

        module.addProvider(Cli, this.cli);

        providers.forEach((providerType: Provider): void => {
            // Logger.info(" ->", (providerType as any).name);

            module.addProvider(providerType);
        });

        const controllers = Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, module.type) || [];

        controllers.forEach((controller: any) => {
            module.addController(controller);
        });
    }

    public async scanDynamicModules() {
        for(const [moduleType, module] of this.container.modules) {
            if(moduleType.prototype.load) {
                const {imports} = await moduleType.prototype.load(this.container);

                for(const type of imports) {
                    const isModule = Reflect.getMetadata(IS_MODULE_METADATA, type);

                    if(!isModule) {
                        continue;
                    }

                    const subModule = await this.scanModules(type, module);

                    if(subModule) {
                        await this.scanModuleDependencies(subModule);
                    }
                }
            }
        }
    }

    public async scanRoutes() {
        for(const [, module] of this.container.modules) {
            for(const [type, controller] of module.controllers) {
                const controllerCommands: any[] = [];
                const controllerCompletions: any[] = [];

                for(const name of Object.getOwnPropertyNames(type.prototype)) {
                    const descriptor = Object.getOwnPropertyDescriptor(type.prototype, name);

                    if(!descriptor) {
                        continue;
                    }

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

                        const command = this.cli.command(commandName);

                        command.help({
                            description: "Des"
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

                    this.cli.command(commandName)
                        .action((input: CommandInput) => {
                            const args: any[] = [];
                            const params = Object.values(input.arguments());

                            argsMeta.forEach((argMeta: any) => {
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

                            this.cli.command(command).completion(name, () => {
                                return controller.instance[method]();
                            });
                        }
                    }
                    else {
                        this.cli.command(commandName).completion(name, () => {
                            return controller.instance[method]();
                        });
                    }
                }
            }
        }
    }

    public async init() {
        for(const [, module] of this.container.modules) {
            module.providers.forEach((provider) => {
                provider.instance;
            });

            module.controllers.forEach((controller) => {
                controller.instance;
            });
        }
    }

    public async run(args: string[]) {
        return this.cli.run(args);
    }

    public getContainer() {
        return this.container;
    }

    public static async create(module: any) {
        const factory = new this();

        await factory.scan(module);

        return new ApplicationContext(
            module,
            factory.getContainer()
        );
    }
}
