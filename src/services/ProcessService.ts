import Path from "path";
import {Injectable} from "../decorators";


@Injectable()
export class ProcessService {
    public pwd(path: string = ""): string {
        return Path.join(process.cwd(), path);
    }

    public cd(path: string): void {
        this.chdir(this.pwd(path));
    }

    public chdir(path: string): void {
        process.chdir(path);
    }
}
