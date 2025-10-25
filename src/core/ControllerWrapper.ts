import {CommandInput} from "@kearisp/cli";
import {Type} from "../types";
import {DESCRIPTION_METADATA} from "../env";
import {InstanceWrapper} from "./InstanceWrapper";
import {ModuleWrapper} from "./ModuleWrapper";
import {Route} from "./Route";


export class ControllerWrapper<TInput = any> extends InstanceWrapper {
    public readonly _type!: Type<TInput>;
    public description?: string;
    public commands: Route[] = [];
    public completions: Route[] = [];

    public constructor(module: ModuleWrapper, type: Type<TInput>) {
        super(module, type);

        if(!this._type) {
            return;
        }

        this.description = Reflect.getMetadata(DESCRIPTION_METADATA, this._type) || "";

        for(const method of Object.getOwnPropertyNames(this._type.prototype)) {
            const route = new Route(this._type, method);

            if(route.isCommand) {
                this.commands.push(route);
            }
            else if(route.isCompletion) {
                this.completions.push(route);
            }
            else {
                // TODO: Log
            }
        }
    }

    public getCompletionCommands(name: string, command: string): Route[] {
        const completions = this.completions.filter((route) => {
            return route.completions.filter((completion) => {
                return completion.name === name && completion.command === command;
            }).length > 0;
        });

        if(completions.length > 0) {
            return completions;
        }

        return this.completions.filter((route) => {
            return route.completions.filter((completion) => {
                return completion.name === name && !completion.command;
            }).length > 0;
        });
    }

    public run(route: Route, input: CommandInput) {
        const args: any[] = [];

        route.args.forEach((arg, index) => {
            switch(arg.type) {
                case "param":
                    args[index] = input.argument(arg.name);
                    break;

                case "option":
                    if(route.designTypes[index] === Array) {
                        args[index] = input.options(arg.name);
                    }
                    else {
                        args[index] = input.option(arg.name);
                    }
                    break;
            }
        });

        return this.instance[route.method](...args);
    }
}
