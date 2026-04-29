import {AsyncStorage} from "../core/AsyncStorage";
import {AppService} from "../services/AppService";
import {ProjectRepository} from "../services/ProjectRepository";
import {ProjectConfig} from "./ProjectConfig";
import {volumeParse} from "../utils/volumeParse";
import {EnvConfig, ProjectConfigScope, ProjectRef, ProjectType} from "../types";


export class Project {
    protected _ref?: ProjectRef;
    public readonly configs: Record<ProjectConfigScope, ProjectConfig>;

    public constructor(
        public name: string,
        public path: string
    ) {
        const container = AsyncStorage.getContainer(),
              appService = container.get(AppService),
              projectRepository = container.get(ProjectRepository);

        this._ref = appService.getProject(this.name);

        this.configs = {
            [ProjectConfigScope.APP]: projectRepository.getConfig(ProjectConfigScope.APP, this.name, this.path),
            [ProjectConfigScope.LOCAL]: projectRepository.getConfig(ProjectConfigScope.LOCAL, this.name, this.path)
        };
    }

    public get ref(): ProjectRef | undefined {
        return this._ref;
    }

    public get type(): ProjectType {
        return this.configs.app.type || this.configs.project.type!;
    }

    public set type(type: ProjectType) {
        this.configs.app.type = type;
    }

    public get containerName(): string {
        return `${this.name}.workspace`;
    }

    public get scripts() {
        return {
            ...this.configs.project.scripts,
            ...this.configs.app.scripts
        };
    }

    public get preset() {
        return this.configs.app.preset || this.configs.project.preset;
    }

    public set preset(preset: string | undefined) {
        this.configs.app.preset = preset;
    }

    public get presetMode() {
        return this.configs.app.presetMode! || this.configs.project.presetMode!;
    }

    public set presetMode(mode: "project" | "global") {
        this.configs.app.presetMode = mode;
    }

    public get image(): string | undefined {
        return this.configs.app.image || this.configs.project.image;
    }

    /** @deprecated */
    public get imageName(): string | undefined {
        return this.configs.app.image || this.configs.project.image;
    }

    /** @deprecated */
    public set imageName(image: string | undefined) {
        this.configs.app.image = image;
    }

    public get dockerfile(): string | undefined {
        return this.configs.app.dockerfile || this.configs.project.dockerfile;
    }

    public set dockerfile(dockerfile: string | undefined) {
        this.configs.app.dockerfile = dockerfile;
    }

    public get composefile(): string | undefined {
        return this.configs.app.composefile || this.configs.project.composefile;
    }

    public set composefile(composefile: string | undefined) {
        this.configs.app.composefile = composefile;
    }

    public get cmd() {
        return this.configs.app.cmd || this.configs.project.cmd;
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

    public get volumes(): string[] {
        return [
            ...this.configs.project.volumes.filter((volume) => {
                return !this.configs.app.getVolumeByDestination(volumeParse(volume).destination);
            }),
            ...this.configs.app.volumes
        ];
    }

    public get ports(): string[] {
        return [
            ...this.configs.project.ports,
            ...this.configs.app.ports
        ];
    }

    public set ports(ports: string[]) {
        this.configs.app.ports = ports;
    }

    public linkPort(hostPort: number, containerPort: number): void {
        this.configs.app.ports = [
            ...this.configs.app.ports.filter((link: string) => {
                return link !== `${hostPort}:${containerPort}`;
            }),
            `${hostPort}:${containerPort}`
        ];
    }

    public unlinkPort(hostPort: number, containerPort: number): void {
        this.configs.app.ports = this.configs.app.ports.filter((link: string) => {
            return link !== `${hostPort}:${containerPort}`;
        });
    }

    public get buildArgs() {
        return {
            ...this.configs.project.buildArgs,
            ...this.configs.app.buildArgs
        };
    }

    public set buildArgs(buildArgs: EnvConfig) {
        this.configs.app.buildArgs = buildArgs;
    }

    public setBuildArg(key: string, value: string, service?: string): void {
        this.configs.app.setBuildArg(key, value, service);
    }

    public unsetBuildArg(name: string, service?: string): void {
        this.configs.app.unsetBuildArg(name, service);
    }

    public get env() {
        return {
            ...this.configs.project.env,
            ...this.configs.app.env
        };
    }

    public set env(env: EnvConfig) {
        this.configs.app.env = env;
    }

    public hasEnv(name: string): boolean {
        return this.configs.app.hasEnv(name) || this.configs.project.hasEnv(name);
    }

    public getEnv(key: string): string | undefined;
    public getEnv(key: string, byDefault: string): string;
    public getEnv(key: string, byDefault?: string): string | undefined {
        return this.configs.app.env[key] || this.configs.project.env[key] || byDefault;
    }

    public setEnv(key: string, value: string | boolean, service?: string): void {
        this.configs.app.setEnv(key, value, service);
    }

    public unsetEnv(key: string, service?: string): void {
        this.configs.app.unsetEnv(key, service);
    }

    public hasMeta(key: string): boolean {
        return this.configs.app.metadata.hasOwnProperty(key) || this.configs.project.metadata.hasOwnProperty(key);
    }

    public getMeta(key: string): string | undefined;
    public getMeta(key: string, byDefault: string): string;
    public getMeta(key: string, byDefault?: string): string | undefined {
        return this.configs.app.metadata[key] || this.configs.project.metadata[key] || byDefault;
    }

    public setMeta(name: string, value: string | boolean): void {
        this.configs.app.metadata[name] = typeof value === "boolean"
            ? (value ? "true" : "false")
            : value;
    }

    public unsetMeta(name: string): void {
        if(name in this.configs.app.metadata) {
            delete this.configs.app.metadata[name];
        }
    }

    public getVolumeBySource(source: string): string | undefined {
        return this.configs.project.getVolumeBySource(source) || this.configs.app.getVolumeBySource(source);
    }

    public getVolumeByDestination(destination: string): string | undefined {
        return this.configs.project.getVolumeByDestination(destination) || this.configs.app.getVolumeByDestination(destination);
    }

    public volumeMount(...volumes: string[]): void {
        this.configs.app.volumeMount(...volumes);
    }

    public volumeUnmount(...volumes: string[]): void {
        this.configs.app.volumeUnmount(...volumes);
    }

    public get extraHosts() {
        return {
            ...this.configs.project.extraHosts,
            ...this.configs.app.extraHosts
        };
    };

    public addExtraHost(host: string, domain: string): void {
        this.configs.app.addExtraHost(host, domain);
    }

    public removeExtraHost(host: string): void {
        this.configs.app.removeExtraHost(host);
    }

    public get metadata() {
        return {
            ...this.configs.project.metadata,
            ...this.configs.app.metadata
        };
    }

    public get services() {
        return this.configs.app.services;
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
}
