import {EnvConfig} from "../types";
import {PluginRef} from "../types/PluginRef";
import {PresetRef} from "../types/PresetRef";
import {ProjectRef, ProjectOldRef} from "../types/ProjectRef";
import {PRESET_SOURCE_EXTERNAL, PRESET_SOURCE_INTERNAL, PresetSource} from "./Preset";


export type AppConfigProperties = {
    debug?: boolean;
    keystore?: string;
    logLevel?: "off" | "info" | "warn" | "error";
    plugins?: PluginRef[];
    presets?: PresetRef[];
    projects?: ProjectOldRef[];
    meta?: EnvConfig;
    env?: EnvConfig;
};

export class AppConfig {
    public debug?: boolean;
    public keystore?: string;
    public logLevel: "off" | "info" | "warn" | "error" = "off";
    public plugins: PluginRef[];
    public presets: PresetRef[];
    public projects: ProjectRef[];
    public meta?: EnvConfig;
    public env?: EnvConfig;

    public constructor(data: AppConfigProperties) {
        const {
            plugins = [],
            presets = [],
            projects = [],
            ...rest
        } = data;

        Object.assign(this as Object, rest);

        this.plugins = plugins.map((plugin) => {
            if(typeof plugin === "string") {
                return {
                    name: plugin,
                    env: "latest"
                };
            }

            return plugin;
        });

        this.presets = presets;
        this.projects = projects.map((ref) => {
            const {
                id,
                name,
                path,
                src
            } = ref;

            return {
                name: (name || id) as string,
                path: (path || src) as string
            };
        });
    }

    public addPlugin(name: string, env: PluginRef["env"] = "latest"): void {
        const plugin = this.plugins.find((plugin) => plugin.name === name);

        if(plugin) {
            plugin.name = name;
            plugin.env = env;
            return;
        }

        this.plugins.push({
            name,
            env
        });
    }

    public removePlugin(name: string): void {
        if(this.plugins.length === 0) {
            return;
        }

        this.plugins = this.plugins.filter((plugin) => plugin.name !== name);
    }

    public getProject(name: string): ProjectRef|undefined {
        if(!this.projects) {
            return;
        }

        return this.projects.find((projectData) => {
            return projectData.name === name;
        });
    }

    public addProject(id: string, name: string, path: string): void {
        let projectRef = this.getProject(name);

        if(!projectRef) {
            this.projects.push({
                name,
                path
            });
            return;
        }

        projectRef.name = name;
        projectRef.path = path;
    }

    public removeProject(name: string): void {
        if(this.projects.length === 0) {
            return;
        }

        this.projects = this.projects.filter((projectData): boolean => {
            return projectData.name !== name;
        });
    }

    public registerPreset(name: string, source: PresetSource, path?: string): void {
        if(source === PRESET_SOURCE_INTERNAL) {
            return;
        }

        let presetData = this.presets.find((preset): boolean => {
            if(source === PRESET_SOURCE_EXTERNAL && preset.path === path) {
                return true;
            }

            return preset.name === name;
        });

        if(!presetData) {
            presetData = {
                name,
                source
            };

            this.presets.push(presetData);
        }

        presetData.source = source;

        if(presetData.source === PRESET_SOURCE_EXTERNAL) {
            presetData.path = path;
        }
        else if(presetData.path) {
            delete presetData.path;
        }
    }

    public unregisterPreset(name: string): void {
        if(this.presets.length === 0) {
            return;
        }

        this.presets = this.presets.filter((preset) => {
            return preset.name !== name;
        });
    }

    public hasMeta(name: string): boolean {
        if(!this.meta) {
            return false;
        }

        return name in this.meta;
    }

    public getMeta(name: string, defaultValue?: string): string|undefined;
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

    public getEnv(name: string): string|undefined;
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

    /**
     * @deprecated
     */
    public save(): void {}

    /**
     * @deprecated
     */
    public toJson(): AppConfigProperties {
        return this.toObject();
    }

    public toObject(): AppConfigProperties {
        return {
            debug: this.debug,
            logLevel: this.logLevel,
            keystore: this.keystore,
            plugins: this.plugins.length > 0 ? this.plugins : undefined,
            presets: this.presets.length > 0 ? this.presets : undefined,
            projects: this.projects.length > 0 ? this.projects : undefined,
            env: this.env,
            meta: this.meta
        };
    }

    public toJsString(): string {
        const json = JSON.stringify(this.toObject(), null, 4);

        return `// Wocker config\nexports.config = ${json};`;
    }

    public toString(): string {
        return JSON.stringify(this.toObject(), null, 4);
    }
}
