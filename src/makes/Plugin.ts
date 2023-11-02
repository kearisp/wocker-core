import {Cli} from "@kearisp/cli";
import {Controller} from "./Controller";


class Plugin extends Controller {
    public install(cli: Cli) {
        super.install(cli);
    }
}


export {Plugin};
