import {FileSystem} from "./FileSystem";
import {EnvConfig, ProjectType} from "../types";
import {volumeParse} from "../utils/volumeParse";
import {JsonEditor} from "./JsonEditor";
import {ServiceConfig} from "./ServiceConfig";


export class ProjectConfig extends JsonEditor<ProjectConfig.Data> {
    // public editor: JsonEditor<ProjectConfig.Data>;
    // protected state: ProjectConfig.Data;

    // public type?: ProjectType;
    // public image?: string;
    // public dockerfile?: string;
    // public composefile?: string;
    // public preset?: string;
    // public presetMode?: "global" | "project";
    // public scripts: {
    //     [script: string]: string;
    // };
    // public cmd?: string[];
    // public metadata: EnvConfig;
    // public ports: string[];
    // public volumes: string[];
    // public extraHosts: EnvConfig;
    // public services: Record<string, ProjectConfig.Service>;

    public constructor(content: string) {
        super(content);

        // this.editor = new JsonEditor<ProjectConfig.Data>(content);

        // const {
        //     type,
        //     imageName,
        //     image = imageName,
        //     dockerfile,
        //     composefile,
        //     preset,
        //     presetMode,
        //     scripts = {},
        //     cmd,
        //     metadata = {},
        //     volumes = [],
        //     ports = [],
        //     extraHosts = {},
        //     services = {}
        // } = data;

        // this.type = type;
        // this.image = image;
        // this.dockerfile = dockerfile;
        // this.composefile = composefile;
        // this.preset = preset;
        // this.presetMode = presetMode;
        // this.scripts = scripts;
        // this.cmd = cmd;
        // this.metadata = metadata;
        // this.volumes = volumes;
        // this.ports = ports;
        // this.extraHosts = extraHosts;
        // this.services = services;
    }

    public get type(): ProjectType | undefined {
        return this.state.type;
    }

    public set type(type: ProjectType | undefined) {
        this.state.type = type;
    }

    public get buildArgs(): EnvConfig {
        return this.createProxy(["buildArgs"], {
            removeOnEmpty: true
        });
    }

    public set buildArgs(buildArgs: EnvConfig) {
        this.state.buildArgs = {...buildArgs};
    }

    public get env(): EnvConfig {
        return this.createProxy(["env"], {
            removeOnEmpty: true
        });
    }

    public set env(env: EnvConfig | undefined) {
        this.state.env = env ? {...env} : env;
    }

    public get metadata(): EnvConfig {
        return this.createProxy(["metadata"], {
            removeOnEmpty: true
        });
    }

    public set metadata(metadata) {
        this.state.metadata = {...metadata};
    }

    public get preset(): string | undefined {
        return this.state.preset;
    }

    public set preset(preset: string | undefined) {
        this.state.preset = preset;
    }

    public get presetMode(): "project" | "global" | undefined {
        return this.state.presetMode;
    }

    public set presetMode(presetMode) {
        this.state.presetMode = presetMode;
    }

    public get image(): string | undefined {
        return this.state.image;
    }

    public set image(image: string | undefined) {
        this.state.image = image;
    }

    public get imageName(): string | undefined {
        return this.state.imageName;
    }

    public set imageName(image: string | undefined) {
        this.state.imageName = image;
    }

    public get composefile(): string | undefined {
        return this.state.composefile;
    }

    public set composefile(composefile: string | undefined) {
        this.state.composefile = composefile;
    }

    public get dockerfile(): string | undefined {
        return this.state.dockerfile;
    }

    public set dockerfile(dockerfile: string | undefined) {
        this.state.dockerfile = dockerfile;
    }

    public get cmd(): string[] | undefined {
        return this.state.cmd;
    }

    public set cmd(cmd: string[] | undefined) {
        this.state.cmd = cmd;
    }

    public get scripts(): any {
        return {};
    }

    public get services(): any {
        return {};
    }

    public get extraHosts(): any {
        return this.createProxy(["extraHosts"]);
    }

    public set extraHosts(extraHosts: any) {
        this.state.extraHosts = {...extraHosts};
    }

    public get volumes(): string[] {
        return this.createProxy(["volumes"], {
            removeOnEmpty: true,
            isArray: true
        });
    }

    public set volumes(volumes: string[]) {
        this.state.volumes = volumes;
    }

    public get ports(): string[] {
        return this.createProxy(["ports"], {
            isArray: true,
            removeOnEmpty: true
        });
    }

    public set ports(ports: string[]) {
        this.state.ports = [...ports];
    }

    public setBuildArg(key: string, value: string, service?: string): void {
        if(service) {
            // if(!this.services[service]) {
            //     this.services[service] = {};
            // }
            //
            // if(!this.services[service].buildArgs) {
            //     this.services[service].buildArgs = {};
            // }
            //
            // this.services[service].buildArgs[key] = value;

            return;
        }

        this.buildArgs[key] = value;
    }

    public unsetBuildArg(name: string, service?: string): void {
        if(service) {
            // if(!this.services[service]) {
            //     return;
            // }
            //
            // if(this.services[service].buildArgs && name in this.services[service].buildArgs) {
            //     delete this.services[service].buildArgs[name];
            // }

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
        // return this.env.hasOwnProperty(key);
        return key in this.env;
    }

    public setEnv(key: string, value: string | boolean, service?: string): void {
        const sValue = typeof value === "boolean"
            ? (value ? "true" : "false")
            : value;

        if(service) {
            // if(!this.services[service]) {
            //     return;
            // }
            //
            // if(!this.services[service].env) {
            //     this.services[service].env = {};
            // }
            //
            // this.services[service].env[key] = sValue;

            return;
        }

        this.env[key] = sValue;
    }

    public unsetEnv(key: string, service?: string): void {
        if(service) {
            // if(!this.services[service]) {
            //     throw new Error(`Service "${service}" not found`);
            // }
            //
            // if(this.services[service].env && key in this.services[service].env) {
            //     delete this.services[service].env[key];
            //
            //     if(Object.keys(this.services[service].env).length === 0) {
            //         delete this.services[service].env;
            //     }
            // }

            return;
        }

        if(key in this.env) {
            delete this.env[key];
        }
    }

    public getVolumeBySource(source: string): string | undefined {
        return (this.state.volumes || []).find((volume: string) => {
            return volumeParse(volume).source === source;
        });
    }

    public getVolumeByDestination(destination: string): string | undefined {
        return (this.state.volumes || []).find((volume: string) => {
            return volumeParse(volume).destination === destination;
        });
    }

    public volumeMount(...volumes: string[]): void {
        if(volumes.length === 0) {
            return;
        }

        const [volume, ...restVolumes] = volumes;

        const {destination} = volumeParse(volume);

        this.state.volumes = [
            ...(this.state.volumes || []).filter((v) => {
                return v !== this.getVolumeByDestination(destination);
            }),
            volume
        ];

        this.volumeMount(...restVolumes);
    }

    public volumeUnmount(...volumes: string[]): void {
        if(!this.state.volumes || volumes.length === 0) {
            return;
        }

        const [volume, ...restVolumes] = volumes;

        const v = volumeParse(volume);

        this.state.volumes = this.state.volumes.filter((mounted): boolean => {
            const m = volumeParse(mounted);

            return v.source !== m.source && v.destination !== m.destination;
        });

        if(this.state.volumes.length === 0) {
            return;
        }

        this.volumeUnmount(...restVolumes);
    }

    public addExtraHost(host: string, domain: string): void {
        if(!this.state.extraHosts) {
            this.state.extraHosts = {};
        }

        this.state.extraHosts[host] = domain;
    }

    public removeExtraHost(host: string): void {
        if(this.state.extraHosts && host in this.state.extraHosts) {
            delete this.state.extraHosts[host];
        }
    }

    public addService(name: string, data: ServiceConfig.Data) {

    }

    public service(name: string) {
        return this.createProxy(["services", name], {
            removeOnEmpty: true
        });
    }

    public toObject(): ProjectConfig.Data {
        // return {
        //     type: this.type,
        //     image: this.image,
        //     dockerfile: this.dockerfile,
        //     composefile: this.composefile,
        //     preset: this.preset,
        //     presetMode: this.presetMode,
        //     scripts: Object.keys(this.scripts).length > 0 ? this.scripts : undefined,
        //     cmd: this.cmd,
        //     buildArgs: Object.keys(this.buildArgs).length > 0 ? this.buildArgs : undefined,
        //     env: Object.keys(this.env).length > 0 ? this.env : undefined,
        //     metadata: Object.keys(this.metadata).length > 0 ? this.metadata : undefined,
        //     volumes: this.volumes.length > 0 ? this.volumes : undefined,
        //     ports: this.ports.length > 0 ? this.ports : undefined,
        // };

        return this.state;
    }

    public static make(fs: FileSystem, filename: string): ProjectConfig {
        let content = "{}";

        if(fs.exists(filename)) {
            content = fs.readFile(filename).toString();
        }

        return new class extends ProjectConfig {
            public save(): void {
                // if(!fs.exists()) {
                //     fs.mkdir("", {
                //         recursive: true
                //     });
                // }
                //
                // fs.writeJSON(filename, this.toObject());
            }
        }(content);
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
        services?: Record<string, ProjectConfig.Service>;
    };

    export type Service = {
        type?: "compose" | "plugin";
        containerName?: string;
        buildArgs?: EnvConfig;
        env?: EnvConfig;
        ports?: string[];
        volumes?: string[];
    };
}
