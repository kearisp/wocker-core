import Path from "path";
import {Injectable} from "../decorators";


@Injectable("CORE_PROCESS_SERVICE")
export class ProcessService {
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
}
