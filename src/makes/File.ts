import FS from "fs";
import {Readable} from "stream";
import {createInterface} from "readline";
import {FileSystemDriver} from "../types";


type ReadStreamOptions = {
    start?: number;
    end?: number;
    encoding?: BufferEncoding;
};

type ReadlineStreamOptions = {
    start?: number;
    end?: number;
    encoding?: ReadStreamOptions["encoding"];
};

export class File {
    protected _fd!: number;
    protected _closed: boolean = true;

    public constructor(
        public readonly path: string,
        public readonly flags: FS.OpenMode = "r",
        public readonly mode: FS.Mode | null | undefined,
        protected readonly driver: FileSystemDriver = FS
    ) {
        this.open();
    }

    public get fd(): number {
        return this._fd;
    }

    public get closed(): boolean {
        return this._closed;
    }

    public open() {
        if(!this.closed) {
            return;
        }

        this._fd = this.driver.openSync(this.path, this.flags, this.mode);
        this._closed = false;
    }

    public stat(): FS.Stats {
        return this.driver.fstatSync(this.fd);
    }

    public close(): void {
        if(this.closed) {
            return;
        }

        this.driver.closeSync(this.fd);
        this._closed = true;
    }

    public createReadStream(options?: ReadStreamOptions): FS.ReadStream {
        const stream = this.driver.createReadStream(this.path, {
            ...options || {},
            fd: this.fd,
            autoClose: false,
            emitClose: false
        });

        stream.on("close", (): void => {
            this._closed = true;
        });

        return stream;
    }

    public createReadlineStream(options?: ReadlineStreamOptions): Readable {
        let {
            start,
            end,
            encoding
        } = options || {};

        const startLine = typeof start !== "undefined"
            ? this.getLinePosition(start)
            : undefined;
        const endLine = typeof end !== "undefined"
            ? this.getLinePosition(end)
            : undefined;

        const stream = this.createReadStream({
            encoding: encoding,
            start: startLine,
            end: endLine
        });

        const outputStream = new Readable({
            objectMode: true,
            read() {}
        });

        const readline = createInterface({
            input: stream,
            crlfDelay: Infinity
        });

        readline.on("line", (line: string): void => {
            outputStream.push(line);
        });

        readline.on("close", (): void => {
            outputStream.push(null);
        });

        readline.on("error", (err: Error): void => {
            outputStream.emit("error", err);
        });

        stream.on("error", (err: Error): void => {
            outputStream.emit("error", err);
        });

        return outputStream;
    }

    public readBytes(position: number = 0, size?: number): Buffer<ArrayBuffer> {
        const stats = this.stat();

        if(position < 0 && typeof size === "undefined") {
            size = position * -1;
            position = stats.size - size;
        }
        else if(typeof size === "undefined") {
            size = stats.size - position;
        }

        if(size <= 0) {
            return Buffer.alloc(0);
        }

        const buffer = Buffer.alloc(size)

        this.driver.readSync(this.fd, buffer, 0, size, position);

        return buffer;
    }

    public getLinePosition(line: number): number {
        if(line === 0) {
            throw new Error("Line number must be a non-zero");
        }

        const bufferSize = 1024,
              isForward = line > 0,
              targetLine = Math.abs(line),
              stats = this.stat();

        let position = isForward ? 0 : stats.size,
            currentLine = 0,
            currentOffset = isForward ? 0 : stats.size + 1,
            stump = "";

        while(isForward ? position < stats.size : position > 0) {
            const readSize = isForward
                ? Math.min(bufferSize, stats.size - position)
                : Math.min(bufferSize, position);

            if(!isForward) {
                position -= readSize;
            }

            const chunk = this.readBytes(position, readSize).toString(),
                  lines = (isForward ? stump + chunk : chunk + stump).split("\n");

            if(isForward) {
                position += readSize;
            }

            if(isForward ? position === stats.size : position === 0) {
                stump = "";
            }
            else {
                stump = isForward
                    ? lines.pop() ?? ""
                    : lines.shift() ?? "";
            }

            for(
                let i = isForward ? 0 : lines.length - 1;
                isForward ? i < lines.length : i >= 0;
                isForward ? i++ : i--
            ) {
                const lineLength = Buffer.byteLength(`${lines[i]}\n`);

                currentLine++;

                if(currentLine === targetLine) {
                    return isForward ? currentOffset : currentOffset - lineLength;
                }

                currentOffset += isForward ? lineLength : -lineLength;
            }
        }

        return isForward
            ? Math.min(currentOffset, stats.size)
            : Math.max(currentOffset, 0);
    }
}
