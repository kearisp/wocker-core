import fs, {
    readFile,
    writeFile,
    readdir,
    createWriteStream,
    createReadStream,
    RmOptions
} from "fs";

import {FileSystemManager} from "./FileSystemManager";


/**
 * @deprecated
 */
export class FSManager extends FileSystemManager {
    public path(...parts: string[]): string {
        return this.destination.path(...parts);
    }

    public async readdir(path: string): Promise<string[]> {
        const filePath = this.path(path);

        return new Promise<string[]>((resolve, reject) => {
            readdir(filePath, (err, files) => {
                if(err) {
                    reject(err);
                    return;
                }

                resolve(files);
            });
        });
    }

    public async readJSON(path: string) {
        const filePath = this.path(path);

        const res: Buffer = await new Promise((resolve, reject) => {
            readFile(filePath, (err, data) => {
                if(err) {
                    reject(err);
                    return;
                }

                resolve(data);
            });
        });

        return JSON.parse(res.toString());
    }

    public async writeJSON(path: string, data: any): Promise<void> {
        const json = JSON.stringify(data, null, 4);
        const filePath = this.path(path);

        return new Promise<void>((resolve, reject) => {
            writeFile(filePath, json, (err) => {
                if(err) {
                    reject(err);
                    return;
                }

                resolve(undefined);
            });
        });
    }

    public async rm(path: string, options: RmOptions = {}) {
        const filePath = this.path(path);

        return new Promise((resolve, reject) => {
            fs.rm(filePath, options, (err) => {
                if(err) {
                    reject(err);
                    return;
                }

                resolve(undefined);
            });
        });
    }

    public createWriteStream(...parts: string[]) {
        const filePath = this.path(...parts);

        return createWriteStream(filePath);
    }

    public createReadStream(path: string, options?: Parameters<typeof createReadStream>[1]) {
        const filePath = this.path(path);

        return createReadStream(filePath, options);
    }
}
