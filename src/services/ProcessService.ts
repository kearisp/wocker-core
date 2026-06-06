import Path from "path";
import Readline, {Direction} from "readline";
import {Injectable} from "../decorators";


@Injectable("CORE_PROCESS_SERVICE")
export class ProcessService {
    public get UID(): string | undefined {
        if(!process.getuid) {
            return undefined;
        }

        return `${process.getuid()}`;
    }

    public get GID(): string | undefined {
        if(!process.getgid) {
            return undefined;
        }

        return `${process.getgid()}`;
    }

    public get rows(): number {
        return this.stdout.rows;
    }

    public get columns(): number {
        return this.stdout.columns;
    }

    public get stdin(): NodeJS.ReadStream {
        return process.stdin;
    }

    public get stdout(): NodeJS.WriteStream {
        return process.stdout;
    }

    public get stderr(): NodeJS.WriteStream {
        return process.stdout;
    }

    public pwd(path: string = ""): string {
        return Path.join(process.cwd(), path);
    }

    public cd(path: string): void {
        this.chdir(Path.isAbsolute(path) ? path : this.pwd(path));
    }

    public chdir(path: string): void {
        process.chdir(path);
    }

    public write(chunk: string | Buffer): boolean {
        return this.stdout.write(chunk);
    }

    public getEnv(key: string): string | undefined;
    public getEnv(key: string, byDefault: string): string;
    public getEnv(key: string, byDefault?: string): string | undefined {
        if(key in process.env) {
            return process.env[key];
        }

        return byDefault;
    }

    public setEnv(key: string, value: string): void {
        process.env[key] = value;
    }

    public moveCursor(x: number, y: number) {
        Readline.moveCursor(this.stdout, x, y);
    }

    public cursorTo(x: number, y?: number) {
        Readline.cursorTo(this.stdout, x, y);
    }

    public clearLine(dir: Direction) {
        Readline.clearLine(this.stdout, dir);
    }

    public saveCursor() {
        this.stdout.write("\x1b[s");
    }

    public restoreCursor() {
        this.stdout.write("\x1b[u");
    }
}
