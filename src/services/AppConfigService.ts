import {AppConfig} from "../types/AppConfig";


type TypeMap = {
    [type: string]: string;
};

abstract class AppConfigService {
    public abstract dataPath(...args: string[]): string;
    public abstract pluginsPath(...args: string[]): string;
    public abstract getPWD(): string;
    public abstract setPWD(pwd: string): void;
    public abstract getAppConfig(): Promise<AppConfig>;
    public abstract getMeta(name: string, defaultValue?: string): Promise<string|undefined>;
    public abstract setMeta(name: string, value: string | number | undefined): Promise<void>;
    public abstract getAllEnvVariables(): Promise<AppConfig["env"]>;
    public abstract getEnvVariable(name: string, defaultValue?: string): Promise<string|undefined>;
    public abstract setEnvVariable(name: string, value: string | number): Promise<void>;
    public abstract setProjectConfig(id: string, path: string): Promise<void>;
    public abstract getProjectTypes(): TypeMap;
    public abstract registerProjectType(name: string, title?: string): void;
    public abstract activatePlugin(name: string): Promise<void>;
    public abstract deactivatePlugin(name: string): Promise<void>;
}


export {AppConfigService};
