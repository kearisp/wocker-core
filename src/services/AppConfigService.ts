import Path from "path";
import {Injectable} from "../decorators";
import {AppConfig} from "../makes/AppConfig";
import {ProjectRef, PluginRef, PresetRef, PresetSource} from "../types";
import {AppService} from "./AppService";
import {AppFileSystemService} from "./AppFileSystemService";
import {ProcessService} from "./ProcessService";


/**
 * @deprecated
 */
@Injectable("APP_CONFIG")
export class AppConfigService {
    public constructor(
        protected readonly appService: AppService,
        public readonly fs: AppFileSystemService,
        protected readonly processService: ProcessService
    ) {}

    public get config(): AppConfig {
        return this.appService.config;
    }

    public get debug(): boolean {
        return this.appService.debug;
    }

    public set debug(debug: boolean) {
        this.appService.debug = debug;
    }

    public get experimentalFeatures() {
        return this.appService.experimentalFeatures;
    }

    public get projects(): ProjectRef[] {
        return this.appService.projects;
    }

    public get plugins(): PluginRef[] {
        return this.appService.plugins;
    }

    public get presets(): PresetRef[] {
        return this.appService.presets;
    }

    public getConfig(): AppConfig {
        return this.config;
    }

    public getProjectTypes() {
        return this.appService.getProjectTypes();
    }

    public addProject(name: string, path: string): void {
        this.appService.addProject(name, path);
    }

    public removeProject(name: string): void {
        this.appService.removeProject(name);
    }

    public addPlugin(name: string, env?: PluginRef["env"]): void {
        this.appService.addPlugin(name, env);
    }

    public removePlugin(name: string): void {
        this.appService.removePlugin(name);
    }

    public registerPreset(name: string, source: PresetSource, path?: string): void {
        this.appService.registerPreset(name, source, path);
    }

    public unregisterPreset(name: string): void {
        this.appService.unregisterPreset(name);
    }

    public getEnv(key: string, byDefault?: string): string|undefined;
    public getEnv(key: string, byDefault: string): string;
    public getEnv(key: string, byDefault?: string): string | undefined {
        return this.appService.getEnv(key, byDefault);
    }

    public setEnv(key: string, value: string): void {
        this.appService.setEnv(key, value);
    }

    public unsetEnv(key: string): void {
        this.appService.unsetEnv(key);
    }

    public getMeta(key: string, byDefault?: string): string|undefined
    public getMeta(key: string, byDefault: string): string
    public getMeta(key: string, byDefault?: string): string|undefined {
        return this.appService.getMeta(key, byDefault);
    }

    public setMeta(key: string, value: string): void {
        this.appService.setMeta(key, value);
    }

    public unsetMeta(key: string): void {
        this.appService.unsetMeta(key);
    }

    public isVersionGTE(version: string): boolean {
        return this.appService.isVersionGTE(version);
    }

    public isExperimentalEnabled(key: string): boolean {
        return this.appService.isExperimentalEnabled(key);
    }

    /**
     * @deprecated
     */
    public pwd(...parts: string[]): string {
        return this.processService.pwd(Path.join(...parts));
    }

    /**
     * @deprecated
     */
    public setPWD(pwd: string): void {
        this.processService.chdir(pwd);
    }

    public dataPath(...args: string[]): string {
        return this.appService.fs.path(Path.join(...args));
    }

    public save(): void {
        this.config.save();
    }
}
