import fs, {MakeDirectoryOptions, CopySyncOptions} from "fs"

import {FileSystem} from "./FileSystem";


export class FileSystemManager {
    public readonly source: FileSystem;
    public readonly destination: FileSystem;

    public constructor(source: string, destination: string) {
        this.source = new FileSystem(source);
        this.destination = new FileSystem(destination);
    }

    public exists(...parts: string[]): boolean {
        return this.destination.exists(...parts);
    }

    public mkdir(path: string, options?: MakeDirectoryOptions): void {
        this.destination.mkdir(path, options);
    }

    public copy(path: string, options?: CopySyncOptions): void {
        fs.cpSync(
            this.source.path(path),
            this.destination.path(path),
            options
        );
    }
}
