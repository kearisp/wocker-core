import fs, {RmOptions, Stats, WriteFileOptions} from "fs";
import * as Path from "path";


type ReaddirOptions = fs.ObjectEncodingOptions & {
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

        return fs.existsSync(fullPath);
    }

    public stat(...parts: string[]): Stats {
        const fullPath = this.path(...parts);

        return fs.statSync(fullPath);
    }

    public mkdir(path: string = "", options?: fs.MakeDirectoryOptions): void {
        const fullPath = this.path(path);

        fs.mkdirSync(fullPath, options);
    }

    public async readdir(...parts: string[]): Promise<string[]> {
        const fullPath = this.path(...parts);

        return new Promise((resolve, reject) => {
            fs.readdir(fullPath, (err, files) => {
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
            fs.readdir(fullPath, options as any, (err, files) => {
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

    public readJSON(...paths: string[]): any {
        const filePath = this.path(...paths);

        const res: Buffer = fs.readFileSync(filePath);

        return JSON.parse(res.toString());
    }

    public writeFile(path: string, data: string | Buffer | NodeJS.ArrayBufferView, options?: fs.WriteFileOptions): Promise<void> {
        const fullPath = this.path(path);

        return new Promise((resolve, reject) => {
            const callback = (err: NodeJS.ErrnoException | null): void => {
                if(err) {
                    reject(err);

                    return;
                }

                resolve(undefined);
            };

            if(options) {
                fs.writeFile(fullPath, data, options, callback);
            }
            else {
                fs.writeFile(fullPath, data, callback);
            }
        });
    }

    public writeJSON(path: string, data: any, options?: WriteFileOptions): void {
        const fullPath = this.path(path);
        const json = JSON.stringify(data, null, 4);

        fs.writeFileSync(fullPath, json, options)
    }

    public async rm(path: string, options?: RmOptions): Promise<void> {
        const fullPath = this.path(path);

        return new Promise((resolve, reject) => {
            const callback = (err: NodeJS.ErrnoException | null): void => {
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

    public createWriteStream(path: string): fs.WriteStream {
        return fs.createWriteStream(this.path(path));
    }

    public createReadStream(path: string): fs.ReadStream {
        return fs.createReadStream(this.path(path));
    }
}
