import {Cli} from "@kearisp/cli";

import {Type} from "../types/Type";
import {Container} from "./Container";


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

        const res = module.get(typeOrToken);

        if(!res) {
            throw new Error("Instance not found");
        }

        return res;
    }

    public async run(args: string[]) {
        const cli = this.get(Cli);

        return cli.run(args);
    }
}
