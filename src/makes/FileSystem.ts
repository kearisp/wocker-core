import * as fs from "fs";
import * as Path from "path";


type ReaddirOptions = fs.ObjectEncodingOptions & {
    recursive?: boolean | undefined;
};

export class FileSystem {
    public constructor(
        protected readonly source: string
    ) {}

    public path(...parts: string[]) {
        return Path.join(this.source, ...parts);
    }

    public exists(...parts: string[]): boolean {
        const fullPath = this.path(...parts);

        return fs.existsSync(fullPath);
    }

    public stat(...parts: string[]) {
        const fullPath = this.path(...parts);

        return fs.statSync(fullPath);
    }

    public mkdir(path: string, options?: fs.MakeDirectoryOptions): void {
        const fullPath = this.path(path);

        fs.mkdirSync(fullPath, options);
    }

    public async readdir(...parts: string[]) {
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
}
