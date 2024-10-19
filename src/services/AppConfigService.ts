import {Injectable} from "../decorators";
import {AppConfig} from "../makes";


@Injectable("APP_CONFIG")
export abstract class AppConfigService {
    protected config?: AppConfig;

    get version(): string {
        return "0.0.0";
    }

    public isVersionGTE(version: string) {
        const current = this.version.split(".").map(Number);
        const compare = version.split(".").map(Number);

        for(let i = 0; i < 3; i++) {
            if(current[i] > compare[i]) {
                return true;
            }
            else if(current[i] < compare[i]) {
                return false;
            }
        }

        return true;
    }

    public abstract pwd(...parts: string[]): string;
    public abstract setPWD(pwd: string): void;

    public abstract dataPath(...args: string[]): string;
    public abstract pluginsPath(...args: string[]): string;

    public getConfig(): AppConfig {
        if(!this.config) {
            this.config = this.loadConfig();
        }

        return this.config;
    }

    protected abstract loadConfig(): AppConfig;
}
