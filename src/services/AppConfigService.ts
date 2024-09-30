import {Injectable} from "../decorators";
import {AppConfig} from "../makes";


@Injectable("APP_CONFIG")
abstract class AppConfigService {
    protected config?: AppConfig;

    public abstract setPWD(pwd: string): void;
    public abstract pwd(...parts: string[]): string;

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


export {AppConfigService};
