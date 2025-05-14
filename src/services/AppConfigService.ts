import {Injectable} from "../decorators";
import {AppConfig, PresetSource} from "../makes";


@Injectable("APP_CONFIG")
export abstract class AppConfigService {
    public get experimentalFeatures(): string[] {
        return [
            "projectComposeType"
        ];
    }

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
        this.save();
    }

    public removeProject(id: string): void {
        this.config.removeProject(id);
        this.save();
    }

    public registerPreset(name: string, source: PresetSource, path?: string): void {
        this.config.registerPreset(name, source, path);
        this.save();
    }

    public unregisterPreset(name: string): void {
        this.config.unregisterPreset(name);
        this.save();
    }

    public getMeta(name: string, byDefault?: string): string|undefined;
    public getMeta(name: string, byDefault: string): string;
    public getMeta(name: string, byDefault?: string): string|undefined {
        return this.config.getMeta(name, byDefault);
    }

    public setMeta(name: string, value: string): void {
        this.config.setMeta(name, value);
    }

    public unsetMeta(name: string): void {
        this.config.unsetMeta(name);
    }

    public abstract save(): void;
}
