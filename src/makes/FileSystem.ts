import fs from "fs";
import FS, {RmOptions, Stats, WriteFileOptions} from "fs";
import * as Path from "path";


type ReaddirOptions = FS.ObjectEncodingOptions & {
    recursive?: boolean | undefined;
};

export class FileSystem {
    public constructor(
        protected readonly source: string
    ) {}

    public path(...parts: string[]): string {
        return Path.join(this.source, ...parts);
    }

    public basename(...parts: string[]): string {
        return Path.basename(this.path(...parts));
    }

    public exists(...parts: string[]): boolean {
        const fullPath = this.path(...parts);

        return FS.existsSync(fullPath);
    }

    public stat(...parts: string[]): Stats {
        const fullPath = this.path(...parts);

        return FS.statSync(fullPath);
    }

    public mkdir(path: string, options?: FS.MakeDirectoryOptions): void {
        const fullPath = this.path(path);

        FS.mkdirSync(fullPath, options);
    }

    public async readdir(...parts: string[]) {
        const fullPath = this.path(...parts);

        return new Promise((resolve, reject) => {
            FS.readdir(fullPath, (err, files) => {
                if(err) {
                    reject(err);
                    return;
                }

                resolve(files);
            });
        });
    }

    public async readdirFiles(path: string = "", options?: ReaddirOptions): Promise<string[]> {
        const fullPath = this.path(path);

        return new Promise((resolve, reject) => {
            FS.readdir(fullPath, options as any, (err, files) => {
                if(err) {
                    reject(err);
                    return;
                }

                files = files.filter((path) => {
                    const stat = this.stat(path);

                    return stat.isFile();
                });

                resolve(files);
            });
        });
    }

    public async readJSON(...paths: string[]): Promise<any> {
        const res: Buffer = await new Promise((resolve, reject) => {
            const filePath = this.path(...paths);

            FS.readFile(filePath, (err, data: Buffer): void => {
                if(err) {
                    reject(err);
                    return;
                }

                resolve(data);
            });
        });

        return JSON.parse(res.toString());
    }

    public async writeJSON(path: string, data: any, options?: WriteFileOptions): Promise<void> {
        const fullPath = this.path(path);
        const json = JSON.stringify(data, null, 4);

        return new Promise((resolve, reject) => {
            const callback = (err: NodeJS.ErrnoException | null): void => {
                if(err) {
                    reject(err);
                    return;
                }

                resolve(undefined);
            };

            if(options) {
                FS.writeFile(fullPath, json, options, callback);
            }
            else {
                FS.writeFile(fullPath, json, callback);
            }
        });
    }

    public async rm(path: string, options?: RmOptions): Promise<void> {
        const fullPath = this.path(path);

        return new Promise((resolve, reject) => {
            const callback = (err: NodeJS.ErrnoException | null) => {
                if(err) {
                    reject(err);
                    return;
                }

                resolve(undefined);
            };

            if(options) {
                fs.rm(fullPath, options, callback);
            }
            else {
                fs.rm(fullPath, callback);
            }
        });
    }
}
