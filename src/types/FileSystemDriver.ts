import FS from "fs";


type StreamOptions = {
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

export interface FileSystemDriver {
    openSync(path: string, flags: FS.OpenMode, mode?: FS.Mode | null): number;
    closeSync(fd: number): void;
    readSync(file: number, buffer: NodeJS.ArrayBufferView, offset: number, length: number, position: FS.ReadPosition | null): number;
    existsSync(path: string): boolean;
    statSync(path: string): FS.Stats;
    fstatSync(fd: number): FS.Stats;
    mkdirSync(path: string, options?: FS.MakeDirectoryOptions): void;
    readdir(path: string, options: any, callback: (err: NodeJS.ErrnoException | null, files: string[]) => void): void;
    readdirSync(path: string, options?: any): string[];
    readFileSync(path: string): string | Buffer;
    writeFileSync(path: string, data: string | Buffer | NodeJS.ArrayBufferView, options?: FS.WriteFileOptions): void;
    appendFileSync(path: FS.PathOrFileDescriptor, data: string | Uint8Array, options?: FS.WriteFileOptions): void;
    rmSync(path: string, options?: FS.RmOptions): void;
    createWriteStream(path: string, options?: WriteStreamOptions): FS.WriteStream;
    createReadStream(path: string, options?: ReadStreamOptions): FS.ReadStream;
    watch(file: string, options: FS.WatchOptions, listener?: FS.WatchListener<string | Buffer>): FS.FSWatcher;
    watchFile(path: string, listener: FS.StatsListener): FS.StatWatcher;
}