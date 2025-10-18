import {ApplicationContext} from "./ApplicationContext";
import {Container} from "./Container";
import {Scanner} from "./Scanner";


export class Factory {
    public static async create(module: any): Promise<ApplicationContext> {
        const container = new Container(),
              scanner = new Scanner(container);

        await scanner.scan(module);

        return new ApplicationContext(module, scanner.container);
    }
}
