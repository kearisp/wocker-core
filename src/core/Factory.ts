import {ApplicationContext} from "./ApplicationContext";
import {Container} from "./Container";
import {Scanner} from "./Scanner";
import {ApplicationOptions, Type} from "../types";


export class Factory {
    public static async create(module: Type, options: ApplicationOptions = {}): Promise<ApplicationContext> {
        const container = new Container(),
              scanner = new Scanner(container, options);

        await scanner.scan(module);

        return new ApplicationContext(module, container, options);
    }
}
