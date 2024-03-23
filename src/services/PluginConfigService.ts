import * as Path from "path";
import {mkdirSync, existsSync} from "fs";

import {Injectable, Inject} from "../decorators";
import {PLUGIN_DIR_KEY} from "../env";


@Injectable()
export class PluginConfigService {
    public constructor(
        @Inject(PLUGIN_DIR_KEY)
        protected readonly pluginDir: string
    ) {}

    public dataPath(...parts: string[]): string {
        if(!this.pluginDir) {
            throw new Error("");
        }

        if(!existsSync(this.pluginDir)) {
            mkdirSync(this.pluginDir, {
                recursive: true
            });
        }

        return Path.join(this.pluginDir, ...parts);
    }
}