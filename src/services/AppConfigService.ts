import {Injectable} from "../decorators";
import {Config} from "../makes";


type TypeMap = {
    [type: string]: string;
};

@Injectable("APP_CONFIG")
abstract class AppConfigService {
    protected config?: Config;

    public abstract dataPath(...args: string[]): string;
    public abstract pluginsPath(...args: string[]): string;
    public abstract getPWD(): string;
    public abstract setPWD(pwd: string): void;
    public abstract getProjectTypes(): TypeMap;
    public abstract registerProjectType(name: string, title?: string): void;
    protected abstract loadConfig(): Promise<Config>;

    public async getConfig(): Promise<Config> {
        if(!this.config) {
            this.config = await this.loadConfig();
        }

        return this.config;
    }
}


export {AppConfigService};
