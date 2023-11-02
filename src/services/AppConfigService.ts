import * as Path from "path";
import * as FS from "fs";

import {AppConfig} from "../types/AppConfig";


type TypeMap = {
    [type: string]: string;
};

class AppConfigService {
    protected pwd: string;
    protected mapTypes: TypeMap = {
        image: "Image",
        dockerfile: "Dockerfile"
    };

    public constructor(
        protected DATA_DIR: string,
        protected PLUGINS_DIR: string,
        protected MAP_PATH: string
    ) {
        this.pwd = (process.cwd() || process.env.PWD) as string;
    }

    public dataPath(...args: string[]): string {
        return Path.join(this.DATA_DIR, ...args);
    }

    public pluginsPath(...args: string[]): string {
        return Path.join(this.PLUGINS_DIR, ...args);
    }

    public getData() {
        return "Test";
    }

    public getPWD() {
        return this.pwd;
    }

    public setPWD(pwd: string) {
        this.pwd = pwd;
    }

    public async getAppConfig(): Promise<AppConfig> {
        const content = await FS.promises.readFile(this.MAP_PATH);

        return JSON.parse(content.toString());
    }

    public async setProject() {
        //
    }

    public async getAllEnvVariables(): Promise<AppConfig["env"]> {
        return {};
    }

    public async getEnvVariable(name: string, defaultValue?: string): Promise<string|undefined> {
        return undefined;
    }

    public async setProjectConfig(id: string, path: string) {
        throw new Error("");
    }

    public getProjectTypes() {
        return this.mapTypes;
    }
}


export {AppConfigService};
