import FS from "fs";
import Path from "path";
import {Readable} from "stream";
import {FileSystemDriver, ReadStreamOptions, WriteStreamOptions} from "../types";
import {File} from "./File";


type ReaddirOptions = FS.ObjectEncodingOptions & {
    recursive?: boolean | undefined;
};

type ReadlineOptions = {
    encoding?: BufferEncoding;
    start?: number;
    end?: number;
};

export class FileSystem {
    public constructor(
        protected readonly source: string,
        protected readonly driver: FileSystemDriver = FS
    ) {}

    public path(...parts: string[]): string {
        return Path.join(this.source, ...parts);
    }

    public cd(path: string): FileSystem {
        return new FileSystem(
            this.path(path),
            this.driver
        );
    }

    public readBytes(path: string, position?: number, size?: number): Buffer<ArrayBuffer> {
        const file = this.open(path, "r");

        try {
            return file.readBytes(position, size);
        }
        finally {
            file.close();
        }
    }

    public open(path: string, flags: FS.OpenMode, mode?: FS.Mode | null): File {
        return new File(this.path(path), flags, mode, this.driver);
    }

    public basename(...parts: string[]): string {
        return Path.basename(this.path(...parts));
    }

    public exists(...parts: string[]): boolean {
        const fullPath = this.path(...parts);

        return this.driver.existsSync(fullPath);
    }

    public stat(...parts: string[]): FS.Stats {
        const fullPath = this.path(...parts);

        return this.driver.statSync(fullPath);
    }

    public mkdir(path: string = "", options?: FS.MakeDirectoryOptions): void {
        const fullPath = this.path(path);

        this.driver.mkdirSync(fullPath, options as any);
    }

    public readdir(path: string = "/", options?: {recursive?: boolean;}): string[] {
        const fullPath = this.path(path);

        return this.driver.readdirSync(fullPath, options) as string[];
    }

    /**
     * @deprecated
     */
    public async readdirFiles(path: string = "", options?: ReaddirOptions): Promise<string[]> {
        const fullPath = this.path(path);

        return new Promise<string[]>((resolve, reject) => {
            this.driver.readdir(fullPath, options as any, (err, files) => {
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

    public readFile(path: string): string | Buffer {
        const filePath = this.path(path);

        return this.driver.readFileSync(filePath);
    }

    public readJSON(...paths: string[]): any {
        const filePath = this.path(...paths);

        const res: string | Buffer = this.driver.readFileSync(filePath);

        return JSON.parse(res.toString());
    }

    public writeFile(path: string, data: string | Buffer | NodeJS.ArrayBufferView, options?: FS.WriteFileOptions): void {
        const fullPath = this.path(path);

        this.driver.writeFileSync(fullPath, data, options);
    }

    public writeJSON(path: string, data: any, options?: FS.WriteFileOptions): void {
        const fullPath = this.path(path);
        const json = JSON.stringify(data, null, 4);

        this.driver.writeFileSync(fullPath, json, options)
    }

    public appendFile(path: string, data: string | Uint8Array, options?: FS.WriteFileOptions): void {
        const fullPath = this.path(path);

        this.driver.appendFileSync(fullPath, data, options);
    }

    public rm(path: string, options?: FS.RmOptions): void {
        const fullPath = this.path(path);

        this.driver.rmSync(fullPath, options);
    }

    public createWriteStream(path: string, options?: WriteStreamOptions): FS.WriteStream {
        return this.driver.createWriteStream(this.path(path), options);
    }

    public createReadStream(path: string, options?: ReadStreamOptions): FS.ReadStream {
        return this.driver.createReadStream(this.path(path), options);
    }

    public createReadlineStream(path: string, options?: ReadlineOptions): Readable {
        let {
            encoding,
            start,
            end
        } = options || {};

        const file = this.open(path, "r");

        const stream = file.createReadlineStream({
            encoding,
            start,
            end
        });

        stream.on("end", (): void => {
            file.close();
        });

        stream.on("error", (): void => {
            file.close();
        });

        return stream;
    }

    public getLinePosition(path: string, line: number): number {
        const file = this.open(path, "r");

        try {
            return file.getLinePosition(line);
        }
        finally {
            file.close();
        }
    }

    public watch(path: string, options: FS.WatchOptions = {}): FS.FSWatcher {
        return this.driver.watch(this.path(path), options);
    }
}
