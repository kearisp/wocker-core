import {Injectable} from "../decorators";
import {AppConfig, PresetSource} from "../makes";


@Injectable("APP_CONFIG")
export abstract class AppConfigService {
    public abstract get config(): AppConfig;

    public get version(): string {
        return "0.0.0";
    }

    public isVersionGTE(version: string): boolean {
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

    /**
     * @deprecated
     */
    public getConfig(): AppConfig {
        return this.config;
    }

    public addProject(id: string, name: string, path: string): void {
        this.config.addProject(id, name, path);
        this.config.save();
    }

    public removeProject(id: string): void {
        this.config.removeProject(id);
        this.config.save();
    }

    public registerPreset(name: string, source: PresetSource, path?: string): void {
        this.config.registerPreset(name, source, path);
        this.save();
    }

    public unregisterPreset(name: string): void {
        this.config.unregisterPreset(name);
        this.config.save();
    }

    public save(): void {
        this.config.save();
    }
}
