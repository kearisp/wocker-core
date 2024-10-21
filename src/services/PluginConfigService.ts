import {
    WriteFileOptions,
    MakeDirectoryOptions,
    RmOptions,
    WriteStream,
    ReadStream
} from "fs";

import {FileSystem} from "../makes";
import {Injectable, Inject} from "../decorators";
import {PLUGIN_DIR_KEY} from "../env";


@Injectable()
export class PluginConfigService {
    public constructor(
        @Inject(PLUGIN_DIR_KEY)
        protected readonly pluginDir: string
    ) {}

    public get fs(): FileSystem {
        if(!this.pluginDir) {
            throw new Error("Plugin dir missed");
        }

        const fs = new FileSystem(this.pluginDir);

        if(!fs.exists()) {
            fs.mkdir();
        }

        return fs;
    }

    /** @deprecated */
    public dataPath(...parts: string[]): string {
        return this.fs.path(...parts);
    }

    /** @deprecated */
    public mkdir(path: string, options?: MakeDirectoryOptions): void {
        this.fs.mkdir(path, options);
    }

    /** @deprecated */
    public async writeFile(path: string, data: string | NodeJS.ArrayBufferView, options?: WriteFileOptions): Promise<void> {
        await this.fs.writeFile(path, data, options);
    }

    /** @deprecated */
    public writeJSON(path: string, data: any, options?: WriteFileOptions): void {
        this.fs.writeJSON(path, data, options);
    }

    /** @deprecated */
    public readJSON(path: string): any {
        return this.fs.readJSON(path);
    }

    /** @deprecated */
    public exists(path: string): boolean {
        return this.fs.exists(path);
    }

    /** @deprecated */
    public async rm(path: string, options?: RmOptions): Promise<void> {
        await this.fs.rm(path, options);
    }

    /** @deprecated */
    public async readdir(path: string): Promise<string[]> {
        return this.fs.readdir(path);
    }

    /** @deprecated */
    public createWriteSteam(path: string): WriteStream {
        return this.fs.createWriteStream(path);
    }

    /** @deprecated */
    public createReadStream(path: string): ReadStream {
        return this.fs.createReadStream(path);
    }
}