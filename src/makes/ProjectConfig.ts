import {EnvConfig, ProjectType, ProjectConfigScope} from "../types";
import {volumeParse} from "../utils/volumeParse";
import {JsonEditor} from "./JsonEditor";
import {ServiceConfig} from "./ServiceConfig";


export class ProjectConfig extends JsonEditor<ProjectConfig.Data> {
    public constructor(
        public readonly scope: ProjectConfigScope,
        content: string
    ) {
        super(content, {
            "": [
                // "version",
                "type",
                "image",
                "dockerfile",
                "composefile",
                "preset",
                "presetMode",
                "scripts",
                "cmd",
                "buildArgs",
                "env",
                "metadata",
                "volumes",
                "ports",
                "extraHosts",
                "services"
            ],
            "env": [
                "VIRTUAL_HOST",
                "VIRTUAL_PORT"
            ]
        });
    }

    public get type(): ProjectType | undefined {
        return this.state.type;
    }

    public set type(type: ProjectType | undefined) {
        this.state.type = type;
    }

    public get image(): string | undefined {
        return this.state.image || this.state.imageName;
    }

    public set image(image: string | undefined) {
        this.state.image = image;
        this.state.imageName = undefined;
    }

    public get imageName(): string | undefined {
        return this.image;
    }

    public set imageName(image: string | undefined) {
        this.image = image;
    }

    public get dockerfile(): string | undefined {
        return this.state.dockerfile;
    }

    public set dockerfile(dockerfile: string | undefined) {
        this.state.dockerfile = dockerfile;
    }

    public get composefile(): string | undefined {
        return this.state.composefile;
    }

    public set composefile(composefile: string | undefined) {
        this.state.composefile = composefile;
    }

    public get preset(): string | undefined {
        return this.state.preset;
    }

    public set preset(preset: string | undefined) {
        this.state.preset = preset;
    }

    public get presetMode(): ProjectConfig.Data["presetMode"] {
        return this.state.presetMode;
    }

    public set presetMode(presetMode: ProjectConfig.Data["presetMode"]) {
        this.state.presetMode = presetMode;
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

    public get cmd(): string[] | undefined {
        return this.state.cmd;
    }

    public set cmd(cmd: string[] | undefined) {
        this.state.cmd = cmd;
    }

    public get scripts(): any {
        return this.createProxy(["scripts"], {
            removeOnEmpty: true
        });
    }

    public set scripts(scripts: any) {
        this.state.scripts = scripts;
    }

    public get services(): any {
        return {};
    }

    public get extraHosts(): any {
        return this.createProxy(["extraHosts"], {
            removeOnEmpty: true
        });
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
            this.set(["services", service, "buildArgs", key], value);
            return;
        }

        this.buildArgs[key] = value;
    }

    public unsetBuildArg(key: string, service?: string): void {
        if(service) {
            this.unset(["services", service, "buildArgs", key]);
            return;
        }

        delete this.buildArgs[key];
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
            this.set(["services", service, "env", key], sValue);

            return;
        }

        this.set(["env", key], sValue);
    }

    public unsetEnv(key: string, service?: string): void {
        if(service) {
            this.unset(["services", service, "env", key]);
            return;
        }

        delete this.env[key];
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
