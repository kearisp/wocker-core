import {EnvConfig} from "../../../types";
import {AsyncStorage} from "../../../core/AsyncStorage";
import {volumeParse} from "../../../utils/volumeParse";
import {ProjectRepository} from "../repositories/ProjectRepository";
import {
    ServiceProperties,
    ProjectType,
    ProjectV1
} from "../types";


export class Project {
    /** @deprecated */
    public id?: string;
    public name!: string;
    public type!: ProjectType;
    public path!: string;
    public cmd?: string[];
    public imageName?: string;
    public dockerfile?: string;
    public composefile?: string;
    public preset?: string;
    public presetMode?: "global" | "project";
    public scripts?: {
        [script: string]: string;
    };
    public services: {
        [name: string]: ServiceProperties;
    };
    public buildArgs: EnvConfig;
    public env: EnvConfig;
    public metadata: EnvConfig;
    public ports: string[];
    public extraHosts: EnvConfig;
    public volumes: string[];

    public constructor(data: ProjectV1) {
        const {
            name,
            services = {},
            buildArgs = {},
            env = {},
            metadata = {},
            ports = [],
            extraHosts = {},
            volumes = [],
            ...rest
        } = data;

        this.id = this.name = name;
        this.services = services;
        this.buildArgs = buildArgs;
        this.env = env;
        this.metadata = metadata;
        this.ports = ports;
        this.extraHosts = extraHosts;
        this.volumes = volumes;

        Object.assign(this, rest);
    }

    public get containerName(): string {
        return `${this.name}.workspace`;
    }

    public get domains(): string[] {
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
    }

    public setBuildArg(name: string, value: string, service?: string): void {
        if(service) {
            if(!this.services[service]) {
                throw new Error(`Service "${service}" not found`);
            }

            if(!this.services[service].buildArgs) {
                this.services[service].buildArgs = {};
            }

            this.services[service].buildArgs[name] = value;

            return;
        }

        this.buildArgs[name] = value;
    }

    public unsetBuildArg(name: string, service?: string): void {
        if(service) {
            if(!this.services[service]) {
                throw new Error(`Service "${service}" not found`);
            }

            if(this.services[service].buildArgs && name in this.services[service].buildArgs) {
                delete this.services[service].buildArgs[name];

                if(Object.keys(this.services[service].buildArgs).length === 0) {
                    delete this.services[service].buildArgs;
                }
            }

            return;
        }

        if(name in this.buildArgs) {
            delete this.buildArgs[name];
        }
    }

    public hasEnv(name: string): boolean {
        if(!this.env) {
            return false;
        }

        return this.env.hasOwnProperty(name);
    }

    public getEnv(key: string): string | undefined;
    public getEnv(key: string, byDefault: string): string;
    public getEnv(name: string, defaultValue?: string): string|undefined {
        const {
            [name]: value = defaultValue
        } = this.env || {};

        return value;
    }

    public setEnv(name: string, value: string|boolean, service?: string): void {
        if(!this.env) {
            this.env = {};
        }

        if(service) {
            if(!this.services[service]) {
                throw new Error(`Service "${service}" not found`);
            }

            if(!this.services[service].env) {
                this.services[service].env = {};
            }

            this.services[service].env[name] = typeof value === "boolean"
                ? (value ? "true" : "false")
                : value;

            return;
        }

        this.env[name] = typeof value === "boolean"
            ? (value ? "true" : "false")
            : value;
    }

    public unsetEnv(name: string, service?: string): void {
        if(service) {
            if(!this.services[service]) {
                throw new Error(`Service "${service}" not found`);
            }

            if(this.services[service].env && name in this.services[service].env) {
                delete this.services[service].env[name];

                if(Object.keys(this.services[service].env).length === 0) {
                    delete this.services[service].env;
                }
            }

            return;
        }

        if(name in this.env) {
            delete this.env[name];
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
        if(name in this.metadata) {
            delete this.metadata[name];
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
    }

    public getSecret(key: string): Promise<string | undefined>;
    public getSecret(key: string, byDefault: string): Promise<string>;
    public async getSecret(key: string, byDefault?: string): Promise<string | undefined> {
        const container = AsyncStorage.getContainer(),
              keystoreService = container.get("KEYSTORE_SERVICE");

        return keystoreService.get(`p:${this.name}:${key}`, byDefault);
    }

    public async setSecret(key: string, value: string): Promise<void> {
        const container = AsyncStorage.getContainer(),
              keystoreService = container.get("KEYSTORE_SERVICE");

        return keystoreService.set(`p:${this.name}:${key}`, value);
    }

    public async unsetSecret(key: string): Promise<void> {
        const container = AsyncStorage.getContainer(),
              keystoreService = container.get("KEYSTORE_SERVICE");

        return keystoreService.delete(`p:${this.name}:${key}`);
    }

    public save(): void {
        const container = AsyncStorage.getContainer(),
              projectRepository = container.get(ProjectRepository);

        projectRepository.save(this);
    }

    public toObject(): ProjectV1 {
        return {
            name: this.name,
            type: this.type,
            path: this.path,
            imageName: this.imageName,
            dockerfile: this.dockerfile,
            composefile: this.composefile,
            preset: this.preset,
            presetMode: this.presetMode,
            cmd: this.cmd,
            scripts: this.scripts,
            services: Object.keys(this.services).length > 0 ? this.services : undefined,
            buildArgs: Object.keys(this.buildArgs).length > 0 ? this.buildArgs : undefined,
            env: Object.keys(this.env).length > 0 ? this.env : undefined,
            metadata: Object.keys(this.metadata).length > 0 ? this.metadata : undefined,
            ports: this.ports.length > 0 ? this.ports : undefined,
            extraHosts: Object.keys(this.extraHosts).length ? this.extraHosts : undefined,
            volumes: this.volumes.length > 0 ? this.volumes : undefined,
        };
    }
}
