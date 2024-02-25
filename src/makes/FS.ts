import {Abortable} from "node:events";
import {
    mkdir,
    readFile,
    writeFile,
    rm,
    PathLike,
    PathOrFileDescriptor,
    WriteFileOptions,
    RmOptions,
    MakeDirectoryOptions
} from "fs";
import * as Path from "path";


type ReadFileOptions = Abortable & {
    encoding?: BufferEncoding;
    flag?: string;
};

class FS {
    static async mkdir(path: PathLike, options?: MakeDirectoryOptions) {
        return new Promise((resolve, reject) => {
            mkdir(path, options, (err) => {
                if(err) {
                    reject(err);
                    return;
                }

                resolve(undefined);
            });
        });
    }

    static async readFile(filePath: PathOrFileDescriptor, options?: ReadFileOptions): Promise<string | Buffer> {
        return new Promise((resolve, reject) => {
            readFile(filePath, options, (err, res) => {
                if(err) {
                    reject(err);
                    return;
                }

                resolve(res);
            });
        });
    }

    static async writeFile(filePath: PathOrFileDescriptor, data: string | NodeJS.ArrayBufferView, options?: WriteFileOptions) {
        return new Promise((resolve, reject) => {
            const callback = (err: NodeJS.ErrnoException | null) => {
                if(err) {
                    reject(err);

                    return;
                }

                resolve(undefined);
            };

            if(options) {
                writeFile(filePath, data, options, callback);
            }
            else {
                writeFile(filePath, data, callback);
            }
        });
    }

    static async readJSON(...paths: string[]): Promise<any> {
        const res: Buffer = await new Promise((resolve, reject) => {
            const filePath = Path.join(...paths);

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

    static async writeJSON(filePath: PathOrFileDescriptor, data: any, options?: WriteFileOptions): Promise<void> {
        const json = JSON.stringify(data, null, 4);

        return new Promise((resolve, reject) => {
            const callback = (err: NodeJS.ErrnoException | null) => {
                if(err) {
                    reject(err);

                    return;
                }

                resolve(undefined);
            };

            if(options) {
                writeFile(filePath, json, options, callback);
            }
            else {
                writeFile(filePath, json, callback);
            }
        });
    }

    static async rm(path: PathLike, options?: RmOptions): Promise<void> {
        return new Promise((resolve, reject) => {
            const callback = (err: NodeJS.ErrnoException | null) => {
                if(err) {
                    reject(err);
                    return;
                }

                resolve(undefined);
            };

            if(options) {
                rm(path, options, callback);
            }
            else {
                rm(path, callback);
            }
        });
    }
}


export {FS};
