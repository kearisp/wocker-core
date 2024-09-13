import {Cli} from "@kearisp/cli";

import {InstanceWrapper} from "./InstanceWrapper";
import {Module} from "./Module";
import {InjectionToken} from "../types/InjectionToken";
import {Type} from "../types/Type";


export class Container {
    public readonly modules: Map<Type, Module> = new Map();
    public readonly providers: Map<InjectionToken, InstanceWrapper> = new Map();

    public constructor() {
        const cliWrapper = new InstanceWrapper(new Module(this, null), Cli);

        this.providers.set(Cli, cliWrapper);
    }

    public addModule<TInput = any>(type: Type<TInput>, module: Module): void {
        this.modules.set(type, module);
    }

    public hasModule<TInput = any>(type: Type<TInput>): boolean {
        return this.modules.has(type);
    }

    public getModule<TInput = any>(type: Type<TInput>): Module<TInput> {
        const module = this.modules.get(type);

        if(!module) {
            throw new Error("Module not found");
        }

        return module;
    }

    // public addController(moduleType: any, type: any): void {
    //     const module = this.getModule(moduleType);
    //
    //     if(!module) {
    //         return;
    //     }
    //
    //     module.addController(type);
    // }
}
