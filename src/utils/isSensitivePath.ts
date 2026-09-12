import Path from "path";
import OS from "os";


export const isSensitivePath = (path: string): boolean => {
    const resolved = Path.resolve(path);
    const root = Path.parse(resolved).root;

    if(resolved === root) {
        return true;
    }

    if(Path.dirname(resolved) === root) {
        return true;
    }

    return resolved === Path.resolve(OS.homedir());
};
