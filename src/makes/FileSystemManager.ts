import FS from "fs"
import {pipeline} from "stream/promises";
import {FileSystem} from "./FileSystem";
import {FileSystemDriver} from "../types";


export class FileSystemManager {
    public readonly source: FileSystem;
    public readonly destination: FileSystem;

    public constructor(
        source: string,
        destination: string,
        protected readonly fs: FileSystemDriver = FS
    ) {
        this.source = new FileSystem(source, this.fs);
        this.destination = new FileSystem(destination, this.fs);
    }

    public exists(...parts: string[]): boolean {
        return this.destination.exists(...parts);
    }

    public mkdir(path: string, options?: FS.MakeDirectoryOptions): void {
        this.destination.mkdir(path, options);
    }

    public copy(path: string, options?: FS.CopySyncOptions): void {
        FS.cpSync(
            this.source.path(path),
            this.destination.path(path),
            options
        );
    }

    public async copyFile(path: string): Promise<void> {
        const readStream = this.source.createReadStream(path),
              writeStream = this.destination.createWriteStream(path);

        await pipeline(readStream, writeStream);
    }
}
