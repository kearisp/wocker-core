import {Cli, CommandInput} from "@kearisp/cli";
import {Type, DynamicModule, ProviderType} from "../types";
import {Container} from "./Container";
import {ControllerWrapper} from "./ControllerWrapper";
import {ModuleWrapper} from "./ModuleWrapper";
import {CoreModule} from "./CoreModule";
import {
    IS_GLOBAL_METADATA,
    MODULE_METADATA
} from "../env";


export class Scanner {
    public readonly container: Container;

    public constructor(container?: Container) {
        this.container = container || new Container();
    }

    public async scan(moduleDefinition: Type | DynamicModule): Promise<void> {
        this.scanModule(CoreModule);
        this.scanModule(moduleDefinition);
        await this.scanDynamicModules();
        this.scanRoutes();
    }

    protected getMetadata(moduleDefinition: Type | DynamicModule): DynamicModule {
        if(this.isDynamicModule(moduleDefinition)) {
            const module = moduleDefinition.module;

            return {
                module: moduleDefinition.module,
                global: moduleDefinition.global || Reflect.getMetadata(IS_GLOBAL_METADATA, module),
                inject: moduleDefinition.inject,
                useFactory: moduleDefinition.useFactory,
                imports: [
                    ...Reflect.getMetadata(MODULE_METADATA.IMPORTS, module) || [],
                    ...moduleDefinition.imports || []
                ],
                controllers: [
                    ...Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, module) || [],
                    ...moduleDefinition.controllers || []
                ],
                providers: [
                    ...Reflect.getMetadata(MODULE_METADATA.PROVIDERS, module) || [],
                    ...moduleDefinition.providers || []
                ],
                exports: [
                    ...Reflect.getMetadata(MODULE_METADATA.EXPORTS, module) || [],
                    ...moduleDefinition.exports || []
                ]
            };
        }

        return {
            module: moduleDefinition,
            global: Reflect.getMetadata(IS_GLOBAL_METADATA, moduleDefinition) || false,
            imports: Reflect.getMetadata(MODULE_METADATA.IMPORTS, moduleDefinition) || [],
            controllers: Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, moduleDefinition) || [],
            providers: Reflect.getMetadata(MODULE_METADATA.PROVIDERS, moduleDefinition) || [],
            exports: Reflect.getMetadata(MODULE_METADATA.EXPORTS, moduleDefinition) || []
        };
    }

    protected scanModule(moduleDefinition: Type | DynamicModule): ModuleWrapper {
        const {
            module: moduleType,
            global = false,
            inject,
            useFactory,
            imports = [],
            controllers = [],
            providers = [],
            exports = []
        } = this.getMetadata(moduleDefinition);

        let module = this.container.hasModule(moduleType)
            ? this.container.getModule(moduleType)
            : null;

        if(!module) {
            module = new ModuleWrapper(this.container, moduleType);
            module.global = global;

            if(useFactory) {
                module.factory = useFactory;
                module.factoryInject = inject;
            }

            this.container.addModule(moduleType, module);

            this.scanImports(module, imports);
            this.scanControllers(module, controllers);
            this.scanProviders(module, providers);
            this.scanExports(module, exports);
        }

        return module;
    }

    protected scanControllers(module: ModuleWrapper, controllers: Type[]): void {
        controllers.forEach((controller: any): void => {
            module.addController(controller);
        });
    }

    protected scanProviders(module: ModuleWrapper, providers: ProviderType[]): void {
        providers.forEach((provider: ProviderType): void => {
            module.addProvider(provider);
        });
    }

    protected scanImports(module: ModuleWrapper, imports: any[]): void {
        imports.forEach((importType: any): void => {
            const subModule = this.scanModule(importType);

            module.addImport(subModule);
        });
    }

    protected scanExports(module: ModuleWrapper, exports: any[]): void {
        exports.forEach((type: any): void => {
            module.addExport(type);

            if(module.global) {
                const wrapper = module.getWrapper(type);

                if(wrapper) {
                    this.container.addProvider(type, wrapper);
                }
            }
        });
    }

    protected scanRoutes(): void {
        const cliWrapper = this.container.globalProviders.get(Cli);

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
            const wrapper = this.container.modules.get(type);

            if(!wrapper) {
                return;
            }

            if(wrapper.factory) {
                const {
                    imports = [],
                    controllers = [],
                    providers = [],
                    exports = []
                } = await wrapper.factory(
                    ...(wrapper.factoryInject || []).map((token) => {
                        return wrapper.get(token);
                    })
                );

                this.scanImports(wrapper, imports);
                this.scanControllers(wrapper, controllers);
                this.scanProviders(wrapper, providers);
                this.scanExports(wrapper, exports);
            }
        });

        await Promise.all(promises);
    }

    public isDynamicModule(moduleDefinition: Type | DynamicModule): moduleDefinition is DynamicModule {
        return moduleDefinition && !!(moduleDefinition as DynamicModule).module;
    }
}
