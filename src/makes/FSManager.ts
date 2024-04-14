import fs, {
    readFile,
    writeFile,
    copyFile,
    mkdir,
    readdir,
    existsSync,
    createWriteStream,
    createReadStream,
    MakeDirectoryOptions,
    RmOptions
} from "fs";

import {FileSystem} from "./FileSystem";


export class FSManager {
    public readonly source: FileSystem;
    public readonly destination: FileSystem;

    public constructor(source: string, destination: string) {
        this.source = new FileSystem(source);
        this.destination = new FileSystem(destination);
    }

    public path(...parts: string[]): string {
        return this.destination.path(...parts);
    }

    public async mkdir(path: string, options: MakeDirectoryOptions = {}) {
        const fullPath = this.path(path);

        return new Promise((resolve, reject) => {
            mkdir(fullPath, options, (err) => {
                if(err) {
                    reject(err);
                    return;
                }

                resolve(undefined);
            });
        });
    }

    public async readdir(path: string): Promise<string[]> {
        const filePath = this.path(path);

        return new Promise((resolve, reject) => {
            readdir(filePath, (err, files) => {
                if(err) {
                    reject(err);
                    return;
                }

                resolve(files);
            });
        });
    }

    public exists(path: string) {
        const fullPath = this.path(path);

        return existsSync(fullPath);
    }

    public copy(path: string): Promise<void> {
        const destination = this.path(path);

        if(existsSync(destination)) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            copyFile(this.source.path(path), destination, (err) => {
                if(err) {
                    reject(err);
                    return;
                }

                resolve(undefined);
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

        return new Promise((resolve, reject) => {
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
