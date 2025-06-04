import "reflect-metadata";
import {Cli, CommandInput} from "@kearisp/cli";
import {Provider} from "../types/Provider";
import {Container} from "./Container";
import {ControllerWrapper} from "./ControllerWrapper";
import {Module} from "./Module";
import {
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
            for(const [, controller] of module.controllers) {
                if(!controller.instance) {
                    continue;
                }

                this.scanControllerRoutes(cli, controller)
            }
        }
    }

    protected scanControllerRoutes(cli: Cli, wrapper: ControllerWrapper): void {
        for(const route of wrapper.commands) {
            for(const commandName of route.commandNames) {
                const command = cli.command(commandName);

                if(route.description) {
                    command.help({
                        description: route.description
                    });
                }

                command.action((input: CommandInput) => {
                    return wrapper.run(route, input);
                });

                for(const arg of route.args) {
                    if(arg.type === "option") {
                        command.option(arg.name, arg.params);
                    }

                    command.completion(arg.name, (input: CommandInput) => {
                        const [completion] = wrapper.getCompletionCommands(arg.name, commandName);

                        if(!completion) {
                            return [];
                        }

                        return wrapper.run(completion, input);
                    });
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
