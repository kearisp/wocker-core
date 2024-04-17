import {Module} from "./Module";


export class Container {
    public modules: Map<any, Module> = new Map();

    public hasModule(type: any): boolean {
        return this.modules.has(type);
    }

    public getModule(type: any): Module | undefined {
        return this.modules.get(type);
    }

    public addModule(type: any, module: Module): void {
        this.modules.set(type, module);
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
