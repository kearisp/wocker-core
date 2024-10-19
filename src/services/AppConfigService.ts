import {Injectable} from "../decorators";
import {AppConfig} from "../makes";


@Injectable("APP_CONFIG")
export abstract class AppConfigService {
    protected config?: AppConfig;

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
