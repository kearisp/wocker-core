import {AsyncStorage} from "../core/AsyncStorage";
import {AppService} from "../services/AppService";
import {ProjectRepository} from "../services/ProjectRepository";
import {ProjectConfig} from "./ProjectConfig";
import {volumeParse} from "../utils/volumeParse";
import {LayerResolver} from "./LayerResolver";
import {EnvConfig, ProjectLayerType, ProjectRef, ProjectType, PresetMode} from "../types";


export class Project {
    protected _ref?: ProjectRef;
    protected readonly resolver: LayerResolver<ProjectConfig.Resolvable, ProjectConfig>;

    public constructor(
        public name: string,
        public path: string
    ) {
        const container = AsyncStorage.getContainer(),
              appService = container.get(AppService),
              projectRepository = container.get(ProjectRepository);

        this._ref = appService.getProject(this.name);

        this.resolver = new LayerResolver(ProjectConfig.rules, [
            {
                name: ProjectLayerType.DATA,
                priority: 10,
                data: projectRepository.getConfig(ProjectLayerType.DATA, this.name, this.path)
            },
            {
                name: ProjectLayerType.REPOSITORY,
                priority: 50,
                data: projectRepository.getConfig(ProjectLayerType.REPOSITORY, this.name, this.path)
            },
            {
                name: ProjectLayerType.GLOBAL,
                priority: 100,
                data: projectRepository.getConfig(ProjectLayerType.GLOBAL, this.name, this.path)
            }
        ]);
    }

    public get ref(): ProjectRef | undefined {
        return this._ref;
    }

    public get type(): ProjectType {
        return this.resolver.resolve("type")!;
    }

    public set type(type: ProjectType) {
        this.layer(ProjectLayerType.DATA).type = type;
    }

    public get containerName(): string {
        return `${this.name}.workspace`;
    }

    public get scripts() {
        return this.resolver.resolve("scripts")!;
    }

    public get preset() {
        return this.resolver.resolve("preset");
    }

    public set preset(preset: string | undefined) {
        this.layer(ProjectLayerType.DATA).preset = preset;
    }

    public get presetMode(): PresetMode {
        return this.resolver.resolve("presetMode")!;
    }

    public set presetMode(mode: PresetMode) {
        this.layer(ProjectLayerType.DATA).presetMode = mode;
    }

    public get image(): string | undefined {
        return this.resolver.resolve("image");
    }

    public set image(image: string | undefined) {
        if(!image) {
            delete this.layer(ProjectLayerType.DATA).image;
            return;
        }

        this.layer(ProjectLayerType.DATA).image = image;
    }

    /** @deprecated */
    public get imageName(): string | undefined {
        return this.image;
    }

    /** @deprecated */
    public set imageName(image: string | undefined) {
        this.image = image;
    }

    public get dockerfile(): string | undefined {
        return this.resolver.resolve("dockerfile");
    }

    public set dockerfile(dockerfile: string | undefined) {
        this.layer(ProjectLayerType.DATA).dockerfile = dockerfile;
    }

    public get composefile(): string | undefined {
        return this.resolver.resolve("composefile");
    }

    public set composefile(composefile: string | undefined) {
        this.layer(ProjectLayerType.DATA).composefile = composefile;
    }

    public get cmd() {
        return this.resolver.resolve("cmd");
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
        return this.resolver.resolve("volumes")!;
    }

    public get ports(): string[] {
        return this.resolver.resolve("ports")!;
    }

    public set ports(ports: string[]) {
        this.layer(ProjectLayerType.DATA).ports = ports;
    }

    public linkPort(hostPort: number, containerPort: number): void {
        this.layer(ProjectLayerType.DATA).ports = [
            ...(this.layer(ProjectLayerType.DATA).ports || []).filter((link: string) => {
                return link !== `${hostPort}:${containerPort}`;
            }),
            `${hostPort}:${containerPort}`
        ];
    }

    public unlinkPort(hostPort: number, containerPort: number): void {
        this.layer(ProjectLayerType.DATA).ports = (this.layer(ProjectLayerType.DATA).ports || []).filter((link: string) => {
            return link !== `${hostPort}:${containerPort}`;
        });
    }

    public get buildArgs() {
        return this.resolver.resolve("buildArgs")!;
    }

    public set buildArgs(buildArgs: EnvConfig) {
        this.layer(ProjectLayerType.DATA).buildArgs = buildArgs;
    }

    public setBuildArg(key: string, value: string, service?: string): void {
        this.layer(ProjectLayerType.DATA).setBuildArg(key, value, service);
    }

    public unsetBuildArg(name: string, service?: string): void {
        this.layer(ProjectLayerType.DATA).unsetBuildArg(name, service);
    }

    public get env() {
        return this.resolver.resolve("env")!;
    }

    public set env(env: EnvConfig) {
        this.layer(ProjectLayerType.DATA).env = env;
    }

    public hasEnv(name: string): boolean {
        return name in this.env;
    }

    public getEnv(key: string): string | undefined;
    public getEnv(key: string, byDefault: string): string;
    public getEnv(key: string, byDefault?: string): string | undefined {
        return this.resolver.resolve(["env", key]) ?? byDefault;
    }

    public setEnv(key: string, value: string | boolean, service?: string): void {
        this.layer(ProjectLayerType.DATA).setEnv(key, value, service);
    }

    public unsetEnv(key: string, service?: string): void {
        this.layer(ProjectLayerType.DATA).unsetEnv(key, service);
    }

    public hasMeta(key: string): boolean {
        return key in this.metadata;
    }

    public getMeta(key: string): string | undefined;
    public getMeta(key: string, byDefault: string): string;
    public getMeta(key: string, byDefault?: string): string | undefined {
        return this.resolver.resolve(["metadata", key]) ?? byDefault;
    }

    public setMeta(name: string, value: string | boolean): void {
        this.layer(ProjectLayerType.DATA).metadata[name] = typeof value === "boolean"
            ? (value ? "true" : "false")
            : value;
    }

    public unsetMeta(name: string): void {
        if(name in this.layer(ProjectLayerType.DATA).metadata) {
            delete this.layer(ProjectLayerType.DATA).metadata[name];
        }
    }

    public getVolumeBySource(source: string): string | undefined {
        return [...this.volumes].reverse().find((volume) => {
            return volumeParse(volume).source === source;
        });
    }

    public getVolumeByDestination(destination: string): string | undefined {
        return [...this.volumes].reverse().find((volume) => {
            return volumeParse(volume).destination === destination;
        });
    }

    public volumeMount(...volumes: string[]): void {
        this.layer(ProjectLayerType.DATA).volumeMount(...volumes);
    }

    public volumeUnmount(...volumes: string[]): void {
        this.layer(ProjectLayerType.DATA).volumeUnmount(...volumes);
    }

    public get extraHosts() {
        return this.resolver.resolve("extraHosts")!;
    };

    public addExtraHost(host: string, domain: string): void {
        this.layer(ProjectLayerType.DATA).addExtraHost(host, domain);
    }

    public removeExtraHost(host: string): void {
        this.layer(ProjectLayerType.DATA).removeExtraHost(host);
    }

    public get metadata() {
        return this.resolver.resolve("metadata")!;
    }

    public get services() {
        return this.resolver.resolve("services");
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

    public async getSecrets() {
        const container = AsyncStorage.getContainer(),
              keystoreService = container.get("KEYSTORE_SERVICE"),
              prefix = `p:${this.name}:`,
              keys: string[] = await keystoreService.list();

        return keys
            .filter(key => key.startsWith(prefix))
            .map(key => key.slice(prefix.length));
    }

    public async unsetSecret(key: string): Promise<void> {
        const container = AsyncStorage.getContainer(),
              keystoreService = container.get("KEYSTORE_SERVICE");

        return keystoreService.delete(`p:${this.name}:${key}`);
    }

    public layer(key: ProjectLayerType): ProjectConfig {
        const layer = this.resolver.layer(key);

        if(!layer) {
            throw new Error(`Layer "${key}" not found`);
        }

        return layer.data;
    }

    public layers(): Map<ProjectLayerType, ProjectConfig> {
        return this.resolver.layers.reduce((res, layer) => {
            res.set(layer.name, layer.data);

            return res;
        }, new Map());
    }

    public origin(path: keyof ProjectConfig.Resolvable | string[]): ProjectLayerType | undefined {
        return this.resolver.origin(path) as ProjectLayerType | undefined;
    }

    public save(): void {
        const container = AsyncStorage.getContainer(),
              projectRepository = container.get(ProjectRepository);

        projectRepository.save(this);
    }
}
