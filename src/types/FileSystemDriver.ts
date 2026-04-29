import FS, {
    type Dirent,
    type EncodingOption,
    type BufferEncodingOption,
    type Mode,
    type symlink
} from "fs";


export interface FileSystemDriver {
    openSync(path: string, flags: FS.OpenMode, mode?: FS.Mode | null): number;
    closeSync(fd: number): void;
    readSync(file: number, buffer: NodeJS.ArrayBufferView, offset: number, length: number, position: FS.ReadPosition | null): number;
    existsSync(path: string): boolean;
    statSync(path: string): FS.Stats;
    lstatSync(path: string): FS.Stats;
    fstatSync(fd: number): FS.Stats;
    mkdirSync(path: string, options?: FS.MakeDirectoryOptions): void;
    readdir(path: string, options: any, callback: (err: NodeJS.ErrnoException | null, files: string[]) => void): void;
    readdirSync(path: string, options?: any): (string | Buffer<ArrayBufferLike>)[] | Dirent[] | Dirent<Buffer>[];
    readFileSync(path: string): string | Buffer;
    writeFileSync(path: string, data: string | Buffer | NodeJS.ArrayBufferView, options?: FS.WriteFileOptions): void;
    appendFileSync(path: FS.PathOrFileDescriptor, data: string | Uint8Array, options?: FS.WriteFileOptions): void;
    rmSync(path: string, options?: FS.RmOptions): void;
    createWriteStream(path: string, options?: FileSystemDriver.WriteStreamOptions): FS.WriteStream;
    createReadStream(path: string, options?: FileSystemDriver.ReadStreamOptions): FS.ReadStream;
    watch(file: string, options: FS.WatchOptionsWithStringEncoding, listener?: FS.WatchListener<string | Buffer>): FS.FSWatcher;
    watchFile(path: string, listener: FS.StatsListener): FS.StatWatcher;
    cpSync(source: string, destination: string, opts?: FS.CopySyncOptions): void
    renameSync(oldPath: string, newPath: string): void;
    readlinkSync(path: string, options?: EncodingOption | BufferEncodingOption): string | Buffer<ArrayBuffer>;
    chmodSync(path: string, mode: Mode): void;
    chownSync(path: string, uid: number, gid: number): void;
    symlinkSync(target: string, path: string, type?: symlink.Type): void;
    unlinkSync(path: string): void;
}

export namespace FileSystemDriver {
    export type SymlinkType = symlink.Type;

    export type StreamOptions = {
        flags?: string;
        fd?: number;
        mode?: number;
        start?: number;
        autoClose?: boolean;
        emitClose?: boolean;
        encoding?: BufferEncoding;
        signal?: AbortSignal | null;
        highWaterMark?: number;
    };

    export type WriteStreamOptions = StreamOptions & {
        flush?: boolean;
    };

    export type ReadStreamOptions = StreamOptions & {
        end?: number;
    };
}
