import {Cli} from "@kearisp/cli";

import {Container} from "./Container";
import {Type} from "../types/Type";


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
        const cli = this.get(Cli);

        return cli.run(args);
    }
}
