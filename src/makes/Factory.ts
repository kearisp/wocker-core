import {ApplicationContext} from "./ApplicationContext";
import {Scanner} from "./Scanner";


export class Factory {
    public static async create(module: any): Promise<ApplicationContext> {
        const scanner = new Scanner();
        await scanner.scan(module);

        return new ApplicationContext(module, scanner.container);
    }
}
