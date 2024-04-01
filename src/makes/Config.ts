import {EnvConfig, PickProperties} from "../types";


export type ConfigProperties = PickProperties<Config>;

export abstract class Config {
    public debug?: boolean;
    public logLevel: "off" | "info" | "warn" | "error" = "off";
    public plugins: string[] = [];
    public projects: {
        id: string;
        name?: string;
        src: string;
    }[] = [];
    public meta?: EnvConfig;
    public env?: EnvConfig;

    protected constructor(data: ConfigProperties) {
        Object.assign(this, data);
    }

    public addPlugin(plugin: string): void {
        this.plugins.push(plugin);
    }

    public removePlugin(plugin: string): void {
        this.plugins = this.plugins.filter((plugin) => plugin !== plugin);
    }

    public setProject(id: string, path: string): void {
        this.projects = [
            ...this.projects.filter((project) => {
                return project.id !== id && project.src !== path;
            }),
            {
                id,
                src: path
            }
        ];
    }

    public getMeta(name: string, defaultValue: string): string;
    public getMeta(name: string, defaultValue?: string): string|undefined {
        if(!this.meta || !(name in this.meta)) {
            return defaultValue;
        }

        return this.meta[name];
    }

    public setMeta(name: string, value: string): void {
        if(!this.meta) {
            this.meta = {};
        }

        this.meta[name] = value;
    }

    public unsetMeta(name: string): void {
        if(!this.meta || !(name in this.meta)) {
            return;
        }

        delete this.meta[name];

        if(Object.keys(this.meta).length === 0) {
            delete this.meta;
        }
    }

    public getEnv(name: string, defaultValue: string): string;
    public getEnv(name: string, defaultValue?: string): string|undefined {
        if(!this.env || !(name in this.env)) {
            return defaultValue;
        }

        return this.env[name];
    }

    public setEnv(name: string, value: string): void {
        if(!this.env) {
            this.env = {};
        }

        this.env[name] = value;
    }

    public unsetEnv(name: string): void {
        if(!this.env || !(name in this.env)) {
            return;
        }

        delete this.env[name];

        if(Object.keys(this.env).length === 0) {
            delete this.env;
        }
    }

    public abstract save(): Promise<void>;

    public toJson(): ConfigProperties {
        return {
            debug: this.debug,
            logLevel: this.logLevel,
            plugins: this.plugins,
            projects: this.projects,
            meta: this.meta,
            env: this.env
        };
    }
}
