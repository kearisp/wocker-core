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
import * as Path from "path";


class FSManager {
    public constructor(
        protected source: string,
        protected destination: string
    ) {}

    public path(...parts: string[]): string {
        return Path.join(this.destination, ...parts);
    }

    public async mkdir(path: string, options: MakeDirectoryOptions = {}) {
        const fullPath = Path.join(this.destination, path);

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
        const filePath = Path.join(this.destination, path);

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
        const fullPath = Path.join(this.destination, path);

        return existsSync(fullPath);
    }

    public copy(path: string): Promise<void> {
        const destination = Path.join(this.destination, path);

        if(existsSync(destination)) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            copyFile(Path.join(this.source, path), destination, (err) => {
                if(err) {
                    reject(err);
                    return;
                }

                resolve(undefined);
            });
        });
    }

    public async readJSON(path: string) {
        const filePath = Path.join(this.destination, ...path);

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
        const filePath = Path.join(this.destination, path);

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
        const filePath = Path.join(this.destination, path);

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
        const filePath = Path.join(this.destination, ...parts);

        return createWriteStream(filePath);
    }

    public createReadStream(path: string, options?: Parameters<typeof createReadStream>[1]) {
        const filePath = Path.join(this.destination, path);

        return createReadStream(filePath, options);
    }
}


export {FSManager};
