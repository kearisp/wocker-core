import {FileSystem} from "../../../makes";
import {EnvConfig, ProjectType} from "../../../types";
import {ServiceProperties} from "../types";
import {volumeParse} from "../../../utils/volumeParse";


export abstract class ProjectConfig {
    public type?: ProjectType;
    public image?: string;
    public dockerfile?: string;
    public composefile?: string;
    public preset?: string;
    public presetMode?: "global" | "project";
    public scripts: {
        [script: string]: string;
    };
    public cmd?: string[];
    public buildArgs: EnvConfig;
    public env: EnvConfig;
    public metadata: EnvConfig;
    public ports: string[];
    public volumes: string[];
    public extraHosts: EnvConfig;
    public services: Record<string, ServiceProperties>;

    public constructor(data: ProjectConfig.Data) {
        const {
            type,
            imageName,
            image = imageName,
            dockerfile,
            composefile,
            preset,
            presetMode,
            scripts = {},
            cmd,
            buildArgs = {},
            env = {},
            metadata = {},
            volumes = [],
            ports = [],
            extraHosts = {},
            services = {}
        } = data;

        this.type = type;
        this.image = image;
        this.dockerfile = dockerfile;
        this.composefile = composefile;
        this.preset = preset;
        this.presetMode = presetMode;
        this.scripts = scripts;
        this.cmd = cmd;
        this.buildArgs = buildArgs;
        this.env = env;
        this.metadata = metadata;
        this.volumes = volumes;
        this.ports = ports;
        this.extraHosts = extraHosts;
        this.services = services;
    }

    public unsetBuildArg(name: string, service?: string): void {
        if(service) {
            if(!this.services[service]) {
                return;
            }

            if(this.services[service].buildArgs && name in this.services[service].buildArgs) {
                delete this.services[service].buildArgs[name];
            }

            return;
        }

        if(name in this.buildArgs) {
            delete this.buildArgs[name];
        }
    }

    public getEnv(key: string): string | undefined;
    public getEnv(key: string, byDefault: string): string;
    public getEnv(key: string, byDefault?: string): string | undefined {
        if(key in this.env) {
            return this.env[key];
        }

        return byDefault;
    }

    public hasEnv(key: string): boolean {
        return this.env.hasOwnProperty(key);
    }

    public setEnv(key: string, value: string | boolean, service?: string): void {
        const sValue = typeof value === "boolean"
            ? (value ? "true" : "false")
            : value;

        if(service) {
            if(!this.services[service]) {
                return;
            }

            if(!this.services[service].env) {
                this.services[service].env = {};
            }

            this.services[service].env[key] = sValue;

            return;
        }

        this.env[key] = sValue;
    }

    public unsetEnv(key: string, service?: string): void {
        if(service) {
            if(!this.services[service]) {
                throw new Error(`Service "${service}" not found`);
            }

            if(this.services[service].env && key in this.services[service].env) {
                delete this.services[service].env[key];

                if(Object.keys(this.services[service].env).length === 0) {
                    delete this.services[service].env;
                }
            }

            return;
        }

        if(key in this.env) {
            delete this.env[key];
        }
    }

    public abstract save(): void;

    public getVolumeBySource(source: string): string | undefined {
        return (this.volumes || []).find((volume: string) => {
            return volumeParse(volume).source === source;
        });
    }

    public getVolumeByDestination(destination: string): string | undefined {
        return (this.volumes || []).find((volume: string) => {
            return volumeParse(volume).destination === destination;
        });
    }

    public volumeMount(...volumes: string[]): void {
        if(volumes.length === 0) {
            return;
        }

        const [volume, ...restVolumes] = volumes;

        const {destination} = volumeParse(volume);

        this.volumes = [
            ...(this.volumes || []).filter((v) => {
                return v !== this.getVolumeByDestination(destination);
            }),
            volume
        ];

        this.volumeMount(...restVolumes);
    }

    public volumeUnmount(...volumes: string[]): void {
        if(!this.volumes || volumes.length === 0) {
            return;
        }

        const [volume, ...restVolumes] = volumes;

        const v = volumeParse(volume);

        this.volumes = this.volumes.filter((mounted): boolean => {
            const m = volumeParse(mounted);

            return v.source !== m.source && v.destination !== m.destination;
        });

        if(this.volumes.length === 0) {
            return;
        }

        this.volumeUnmount(...restVolumes);
    }

    public addExtraHost(host: string, domain: string): void {
        this.extraHosts[host] = domain;
    }

    public removeExtraHost(host: string): void {
        if(host in this.extraHosts) {
            delete this.extraHosts[host];
        }
    }

    public toObject(): ProjectConfig.Data {
        return {
            type: this.type,
            image: this.image,
            dockerfile: this.dockerfile,
            composefile: this.composefile,
            preset: this.preset,
            presetMode: this.presetMode,
            scripts: Object.keys(this.scripts).length > 0 ? this.scripts : undefined,
            cmd: this.cmd,
            buildArgs: Object.keys(this.buildArgs).length > 0 ? this.buildArgs : undefined,
            env: Object.keys(this.env).length > 0 ? this.env : undefined,
            metadata: Object.keys(this.metadata).length > 0 ? this.metadata : undefined,
            volumes: this.volumes.length > 0 ? this.volumes : undefined,
            ports: this.ports.length > 0 ? this.ports : undefined,
        };
    }

    public static make(fs: FileSystem, filename: string): ProjectConfig {
        let data: ProjectConfig.Data = {};

        if(fs.exists(filename)) {
            data = fs.readJSON(filename);
        }

        return new class extends ProjectConfig {
            public constructor(data: ProjectConfig.Data) {
                super(data);
            }

            public save(): void {
                if(!fs.exists()) {
                    fs.mkdir("", {
                        recursive: true
                    });
                }

                fs.writeJSON(filename, this.toObject());
            }
        }(data);
    }
}

export namespace ProjectConfig {
    export type Data = {
        type?: ProjectType;
        image?: string;
        /** @deprecated */
        imageName?: string;
        dockerfile?: string;
        composefile?: string;
        preset?: string;
        presetMode?: "global" | "project";
        scripts?: {
            [script: string]: string;
        };
        cmd?: string[];
        buildArgs?: EnvConfig;
        env?: EnvConfig;
        metadata?: EnvConfig;
        volumes?: string[];
        ports?: string[];
        extraHosts?: EnvConfig;
        services?: Record<string, ServiceProperties>;
    };
}
