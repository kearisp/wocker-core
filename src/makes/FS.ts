import {Abortable} from "node:events";
import fs, {
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

/* istanbul ignore next */
/**
 * @deprecated
 */
export class FS {
    public static async mkdir(path: PathLike, options?: MakeDirectoryOptions) {
        return new Promise((resolve, reject) => {
            fs.mkdir(path, options, (err) => {
                if(err) {
                    reject(err);
                    return;
                }

                resolve(undefined);
            });
        });
    }

    public static async readFile(filePath: PathOrFileDescriptor, options?: ReadFileOptions): Promise<string | Buffer> {
        return new Promise<string|Buffer>((resolve, reject) => {
            fs.readFile(filePath, options, (err, res) => {
                if(err) {
                    reject(err);
                    return;
                }

                resolve(res);
            });
        });
    }

    public static async writeFile(filePath: PathOrFileDescriptor, data: string | NodeJS.ArrayBufferView, options?: WriteFileOptions) {
        return new Promise((resolve, reject) => {
            const callback = (err: NodeJS.ErrnoException | null) => {
                if(err) {
                    reject(err);

                    return;
                }

                resolve(undefined);
            };

            if(options) {
                fs.writeFile(filePath, data, options, callback);
            }
            else {
                fs.writeFile(filePath, data, callback);
            }
        });
    }

    public static async readJSON(...paths: string[]): Promise<any> {
        const res: Buffer = await new Promise((resolve, reject) => {
            const filePath = Path.join(...paths);

            fs.readFile(filePath, (err, data) => {
                if(err) {
                    reject(err);

                    return;
                }

                resolve(data);
            });
        });

        return JSON.parse(res.toString());
    }

    public static async writeJSON(filePath: PathOrFileDescriptor, data: any, options?: WriteFileOptions): Promise<void> {
        const json = JSON.stringify(data, null, 4);

        return new Promise<void>((resolve, reject) => {
            const callback = (err: NodeJS.ErrnoException | null) => {
                if(err) {
                    reject(err);

                    return;
                }

                resolve(undefined);
            };

            if(options) {
                fs.writeFile(filePath, json, options, callback);
            }
            else {
                fs.writeFile(filePath, json, callback);
            }
        });
    }

    public static async readdir(path: PathLike): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            fs.readdir(path, (err, files) => {
                if(!err) {
                    resolve(files);
                }
                else {
                    reject(err);
                }
            });
        });
    }

    public static async rm(path: PathLike, options?: RmOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const callback = (err: NodeJS.ErrnoException | null) => {
                if(err) {
                    reject(err);
                    return;
                }

                resolve(undefined);
            };

            if(options) {
                fs.rm(path, options, callback);
            }
            else {
                fs.rm(path, callback);
            }
        });
    }
}
