import fs, {RmOptions, Stats, WriteFileOptions, MakeDirectoryOptions} from "fs";
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

    public mkdir(path: string = "", options?: MakeDirectoryOptions): void {
        const fullPath = this.path(path);

        fs.mkdirSync(fullPath, options as any);
    }

    public readdir(path: string): string[] {
        const fullPath = this.path(path);

        return fs.readdirSync(fullPath);
    }

    public async readdirFiles(path: string = "", options?: ReaddirOptions): Promise<string[]> {
        const fullPath = this.path(path);

        return new Promise<string[]>((resolve, reject) => {
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

    public readFile(path: string): Buffer {
        const filePath = this.path(path);

        return fs.readFileSync(filePath);
    }

    public readJSON(...paths: string[]): any {
        const filePath = this.path(...paths);

        const res: Buffer = fs.readFileSync(filePath);

        return JSON.parse(res.toString());
    }

    public writeFile(path: string, data: string | Buffer | NodeJS.ArrayBufferView, options?: fs.WriteFileOptions): void {
        const fullPath = this.path(path);

        fs.writeFileSync(fullPath, data, options);
    }

    public writeJSON(path: string, data: any, options?: WriteFileOptions): void {
        const fullPath = this.path(path);
        const json = JSON.stringify(data, null, 4);

        fs.writeFileSync(fullPath, json, options)
    }

    public appendFile(path: string, data: string | Uint8Array, options?: WriteFileOptions): void {
        const fullPath = this.path(path);

        fs.appendFileSync(fullPath, data, options);
    }

    public rm(path: string, options?: RmOptions): void {
        const fullPath = this.path(path);

        fs.rmSync(fullPath, options);
    }

    public createWriteStream(path: string, options?: BufferEncoding): fs.WriteStream {
        return fs.createWriteStream(this.path(path), options);
    }

    public createReadStream(path: string, options?: BufferEncoding): fs.ReadStream {
        return fs.createReadStream(this.path(path), options);
    }
}
