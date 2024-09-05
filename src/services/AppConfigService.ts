import {Injectable} from "../decorators";
import {Config} from "../makes";


@Injectable("APP_CONFIG")
abstract class AppConfigService {
    protected config?: Config;

    public abstract getPWD(): string;
    public abstract setPWD(pwd: string): void;

    public abstract dataPath(...args: string[]): string;
    public abstract pluginsPath(...args: string[]): string;

    public async getConfig(): Promise<Config> {
        if(!this.config) {
            this.config = await this.loadConfig();
        }

        return this.config;
    }

    protected abstract loadConfig(): Promise<Config>;
}


export {AppConfigService};
