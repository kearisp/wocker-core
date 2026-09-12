import {FileSystem} from "./FileSystem";
import {
    EnvConfig,
    PackageManagerType,
    Permissions,
    PluginRef,
    PresetRef,
    ProjectRef,
    ProjectOldRef
} from "../types";
import {isPathAllowed} from "../utils/isPathAllowed";


export abstract class AppConfig {
    public debug?: boolean;
    public pm?: PackageManagerType;
    public keystore?: string;
    public plugins: PluginRef[];
    public presets: PresetRef[];
    public projects: ProjectRef[];
    public meta?: EnvConfig;
    public env?: EnvConfig;
    public permissions?: Permissions;

    public constructor(data: AppConfig.Data) {
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
        this.projects = projects.map((ref): ProjectRef => {
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

    public getProject(name: string): ProjectRef | undefined {
        if(!this.projects) {
            return;
        }

        return this.projects.find((projectData) => {
            return projectData.name === name;
        });
    }

    public getProjectByPath(path: string): ProjectRef | undefined {
        return this.projects.find((ref) => {
            return ref.path === path;
        });
    }

    public addProject(name: string, path: string): void {
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

    public registerPreset(presetRef: PresetRef): void {
        const {
            name,
            path
        } = presetRef;

        if(!path) {
            return;
        }

        let presetData = this.presets.find((preset): boolean => {
            return preset.path === path;
        });

        if(!presetData) {
            presetData = {
                name,
                path
            };

            this.presets.push(presetData);
        }

        presetData.name = name;
        presetData.path = path;
    }

    public unregisterPreset(path: string): void {
        if(this.presets.length === 0) {
            return;
        }

        this.presets = this.presets.filter((preset) => {
            return preset.path !== path;
        });
    }

    public hasMeta(name: string): boolean {
        if(!this.meta) {
            return false;
        }

        return name in this.meta;
    }

    public getMeta(name: string, defaultValue?: string): string | undefined;
    public getMeta(name: string, defaultValue: string): string;
    public getMeta(name: string, defaultValue?: string): string | undefined {
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

    public getEnv(key: string, byDefault?: string): string | undefined;
    public getEnv(key: string, byDefault: string): string;
    public getEnv(key: string, byDefault?: string): string | undefined {
        if(!this.env || !(key in this.env)) {
            return byDefault;
        }

        return this.env[key];
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

    public isMountAllowed(path: string): boolean {
        return isPathAllowed(
            path,
            this.permissions?.mounts?.allow,
            this.permissions?.mounts?.deny
        );
    }

    public addMountAllow(path: string): void {
        if(!this.permissions) {
            this.permissions = {};
        }

        if(!this.permissions.mounts) {
            this.permissions.mounts = {};
        }

        if(!this.permissions.mounts.allow) {
            this.permissions.mounts.allow = [];
        }

        if(!this.permissions.mounts.allow.includes(path)) {
            this.permissions.mounts.allow.push(path);
        }

        this.removeMountDeny(path);
    }

    public removeMountAllow(path: string): void {
        if(!this.permissions?.mounts?.allow) {
            return;
        }

        this.permissions.mounts.allow = this.permissions.mounts.allow.filter((entry) => entry !== path);

        this.prunePermissions();
    }

    public addMountDeny(path: string): void {
        if(!this.permissions) {
            this.permissions = {};
        }

        if(!this.permissions.mounts) {
            this.permissions.mounts = {};
        }

        if(!this.permissions.mounts.deny) {
            this.permissions.mounts.deny = [];
        }

        if(!this.permissions.mounts.deny.includes(path)) {
            this.permissions.mounts.deny.push(path);
        }

        this.removeMountAllow(path);
    }

    public removeMountDeny(path: string): void {
        if(!this.permissions?.mounts?.deny) {
            return;
        }

        this.permissions.mounts.deny = this.permissions.mounts.deny.filter((entry) => entry !== path);

        this.prunePermissions();
    }

    protected prunePermissions(): void {
        if(!this.permissions?.mounts) {
            return;
        }

        if(this.permissions.mounts.allow?.length === 0) {
            delete this.permissions.mounts.allow;
        }

        if(this.permissions.mounts.deny?.length === 0) {
            delete this.permissions.mounts.deny;
        }

        if(Object.keys(this.permissions.mounts).length === 0) {
            delete this.permissions.mounts;
        }

        if(Object.keys(this.permissions).length === 0) {
            delete this.permissions;
        }
    }

    public abstract save(): void;

    public toObject(): AppConfig.Data {
        return {
            debug: this.debug,
            pm: this.pm,
            keystore: this.keystore,
            plugins: this.plugins.length > 0 ? this.plugins : undefined,
            presets: this.presets.length > 0 ? this.presets : undefined,
            projects: this.projects.length > 0 ? this.projects : undefined,
            env: this.env,
            meta: this.meta,
            permissions: this.permissions
        };
    }

    public toJsString(): string {
        const json = JSON.stringify(this.toObject(), null, 4);

        return `// Wocker config\nexports.config = ${json};`;
    }

    public static make(fs: FileSystem): AppConfig {
        let data: AppConfig.Data = {};

        if(fs.exists("wocker.config.js")) {
            try {
                const {config} = require(fs.path("wocker.config.js"));

                data = config;
            }
            catch(err) {
                // TODO: Log somehow

                let json = fs.readJSON("wocker.config.json");

                if(typeof json === "string") {
                    json = JSON.parse(json);
                }

                data = json;
            }
        }
        else if(fs.exists("wocker.config.json")) {
            data = fs.readJSON("wocker.config.json");
        }
        else if(fs.exists("wocker.json")) {
            let json = fs.readJSON("wocker.json");

            if(typeof json === "string") {
                json = JSON.parse(json);
            }

            data = json;
        }
        else if(fs.exists("data.json")) {
            data = fs.readJSON("data.json");
        }

        return new class extends AppConfig {
            public save(): void {
                if(!fs.exists()) {
                    fs.mkdir("", {
                        recursive: true
                    });
                }

                fs.writeFile("wocker.config.js", this.toJsString());
                fs.writeJSON("wocker.config.json", this.toObject()); // Backup file

                if(fs.exists("data.json")) {
                    fs.rm("data.json");
                }

                if(fs.exists("wocker.json")) {
                    fs.rm("wocker.json");
                }
            }
        }(data);
    }
}

export namespace AppConfig {
    export type Data = {
        debug?: boolean;
        pm?: PackageManagerType;
        keystore?: string;
        plugins?: PluginRef[];
        presets?: PresetRef[];
        projects?: ProjectOldRef[];
        meta?: EnvConfig;
        env?: EnvConfig;
        permissions?: Permissions;
    };
}
