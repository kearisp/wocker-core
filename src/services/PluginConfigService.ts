import * as Path from "path";
import {
    mkdirSync,
    existsSync,
    createWriteStream,
    createReadStream,
    readdir,
    rm,
    WriteFileOptions,
    MakeDirectoryOptions,
    RmOptions
} from "fs";

import {FS} from "../makes";
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
            throw new Error("Plugin dir missed");
        }

        if(!existsSync(this.pluginDir)) {
            mkdirSync(this.pluginDir, {
                recursive: true
            });
        }

        return Path.join(this.pluginDir, ...parts);
    }

    public async mkdir(path: string, options?: MakeDirectoryOptions) {
        await FS.mkdir(this.dataPath(path), options);
    }

    public async writeFile(path: string, data: string | NodeJS.ArrayBufferView, options?: WriteFileOptions) {
        await FS.writeFile(this.dataPath(path), data, options);
    }

    public async writeJSON(path: string, data: any, options?: WriteFileOptions) {
        await FS.writeJSON(this.dataPath(path), data, options);
    }

    public async readJSON(path: string) {
        return FS.readJSON(this.dataPath(path));
    }

    public exists(path: string) {
        return existsSync(this.dataPath(path));
    }

    public async rm(path: string, options: RmOptions = {}) {
        const fullPath = this.dataPath(path);

        return new Promise((resolve, reject) => {
            rm(fullPath, options, (err) => {
                if(err) {
                    reject(err);
                    return;
                }

                resolve(undefined);
            });
        });
    }

    public async readdir(path: string): Promise<string[]> {
        const fullPath = this.dataPath(path);

        return new Promise((resolve, reject) => {
            readdir(fullPath, (err, files) => {
                if(err) {
                    reject(err);
                    return;
                }

                resolve(files);
            });
        });
    }

    public createWriteSteam(path: string) {
        return createWriteStream(this.dataPath(path));
    }

    public createReadStream(path: string) {
        return createReadStream(this.dataPath(path));
    }
}