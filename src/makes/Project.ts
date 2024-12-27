import {PickProperties, EnvConfig} from "../types";
import {volumeParse} from "../utils/volumeParse";


export type ProjectType = typeof PROJECT_TYPE_DOCKERFILE | typeof PROJECT_TYPE_IMAGE | typeof PROJECT_TYPE_PRESET;
export type ProjectProperties = Omit<PickProperties<Project>, "containerName" | "domains">;

export abstract class Project {
    public id: string;
    public name: string
    public type: string;
    public path: string;
    public preset?: string;
    public presetMode?: "global" | "project";
    public imageName?: string;
    public dockerfile?: string;
    public scripts?: string[];
    public buildArgs?: EnvConfig;
    public env?: EnvConfig;
    public ports?: string[];
    public volumes?: string[];
    public extraHosts?: EnvConfig;
    public metadata?: EnvConfig;

    protected constructor(data: ProjectProperties) {
        this.id = data.id
        this.name = data.name;
        this.type = data.type;
        this.path = data.path;
        this.preset = data.preset;
        this.presetMode = data.presetMode;
        this.imageName = data.imageName;
        this.dockerfile = data.dockerfile;
        this.scripts = data.scripts;
        this.buildArgs = data.buildArgs;
        this.env = data.env;
        this.ports = data.ports;
        this.volumes = data.volumes;
        this.extraHosts = data.extraHosts;
        this.metadata = data.metadata;

        Object.assign(this, data);
    }

    public get containerName(): string {
        return `${this.name}.workspace`;
    }

    get domains(): string[] {
        const host = this.getEnv("VIRTUAL_HOST");

        if(!host) {
            return [];
        }

        return host.split(",");
    }

    public hasDomain(domain: string): boolean {
        return this.domains.includes(domain);
    }

    public addDomain(addDomain: string): void {
        let domains = [
            ...this.domains.filter((domain: string): boolean => {
                return domain !== addDomain;
            }),
            addDomain
        ];

        this.setEnv("VIRTUAL_HOST", domains.join(","));
    }

    public removeDomain(removeDomain: string): void {
        if(!this.hasDomain(removeDomain)) {
            return;
        }

        let domains = this.domains.filter((domain) => {
            return domain !== removeDomain;
        });

        this.setEnv("VIRTUAL_HOST", domains.join(","));
    }

    public clearDomains(): void {
        this.unsetEnv("VIRTUAL_HOST");
    }

    public linkPort(hostPort: number, containerPort: number): void {
        if(!this.ports) {
            this.ports = [];
        }

        this.ports = [
            ...this.ports.filter((link: string) => {
                return link !== `${hostPort}:${containerPort}`;
            }),
            `${hostPort}:${containerPort}`
        ];
    }

    public unlinkPort(hostPort: number, containerPort: number): void {
        if(!this.ports) {
            return;
        }

        this.ports = this.ports.filter((link: string) => {
            return link !== `${hostPort}:${containerPort}`;
        });

        if(this.ports.length === 0) {
            delete this.ports;
        }
    }

    public hasEnv(name: string): boolean {
        if(!this.env) {
            return false;
        }

        return this.env.hasOwnProperty(name);
    }

    public getEnv(name: string, defaultValue?: string): string|undefined {
        const {
            [name]: value = defaultValue
        } = this.env || {};

        return value;
    }

    public setEnv(name: string, value: string|boolean): void {
        if(!this.env) {
            this.env = {};
        }

        this.env[name] = typeof value === "boolean"
            ? (value ? "true" : "false")
            : value;
    }

    public unsetEnv(name: string): void {
        if(!this.env) {
            return;
        }

        if(name in this.env) {
            delete this.env[name];
        }

        if(Object.keys(this.env).length === 0) {
            delete this.env;
        }
    }

    public hasMeta(name: string): boolean {
        return !!this.metadata && this.metadata.hasOwnProperty(name);
    }

    public getMeta<D = string|undefined>(name: string, defaultValue?: D): D {
        const {
            [name]: value = defaultValue
        } = this.metadata || {};

        return value as D;
    }

    public setMeta(name: string, value: string|boolean): void {
        if(!this.metadata) {
            this.metadata = {};
        }

        this.metadata[name] = typeof value === "boolean"
            ? (value ? "true" : "false")
            : value;
    }

    public unsetMeta(name: string): void {
        if(!this.metadata) {
            return;
        }

        if(name in this.metadata) {
            delete this.metadata[name];
        }

        if(Object.keys(this.metadata).length === 0) {
            delete this.metadata;
        }
    }

    public getVolumeBySource(source: string): string|undefined {
        return (this.volumes || []).find((volume: string) => {
            return volumeParse(volume).source === source;
        });
    }

    public getVolumeByDestination(destination: string): string|undefined {
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
            delete this.volumes;
            return;
        }

        this.volumeUnmount(...restVolumes);
    }

    public addExtraHost(host: string, domain: string): void {
        if(!this.extraHosts) {
            this.extraHosts = {};
        }

        this.extraHosts[host] = domain;
    }

    public removeExtraHost(host: string): void {
        if(!this.extraHosts || !this.extraHosts[host]) {
            return;
        }

        delete this.extraHosts[host];

        if(Object.keys(this.extraHosts).length === 0) {
            delete this.extraHosts;
        }
    }

    public abstract getSecret(key: string, byDefault: string): Promise<string>;
    public abstract getSecret(key: string, byDefault?: string): Promise<string | undefined>;
    public abstract setSecret(key: string, value: string): Promise<void>;
    public abstract save(): void;

    public toJSON(): ProjectProperties {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            path: this.path,
            preset: this.preset,
            presetMode: this.presetMode,
            imageName: this.imageName,
            dockerfile: this.dockerfile,
            scripts: this.scripts,
            buildArgs: this.buildArgs,
            env: this.env,
            ports: this.ports,
            volumes: this.volumes,
            extraHosts: this.extraHosts,
            metadata: this.metadata
        };
    }
}

export const PROJECT_TYPE_DOCKERFILE = "dockerfile";
export const PROJECT_TYPE_IMAGE = "image";
export const PROJECT_TYPE_PRESET = "preset";
