import {EnvConfig} from "../types";


export class ServiceConfig {
    protected readonly state: ServiceConfig.Data;

    public constructor(
        protected readonly original: ServiceConfig.Data
    ) {
        this.state = JSON.parse(JSON.stringify(this.original));
    }

    public get buildArgs() {
        if(!this.state.buildArgs) {
            this.state.buildArgs = {};
        }

        return this.state.buildArgs;
    }

    public set buildArgs(buildArgs) {
        this.state.buildArgs = {...buildArgs};
    }

    public get env() {
        if(!this.state.env) {
            this.state.env = {};
        }

        return this.state.env;
    }

    public set env(env) {
        this.state.env = {...env};
    }

    public isDirty() {
        return JSON.stringify(this.toObject()) !== JSON.stringify(this.original);
    }

    public toObject() {
        const {
            type,
            image,
            containerName,
            buildArgs,
            env,
            volumes,
            ports
        } = this.state;

        const object: ServiceConfig.Data = {};

        if(type) {
            object.type = type;
        }

        if(image) {
            object.image = image;
        }

        if(containerName) {
            object.containerName = containerName;
        }

        if(buildArgs && Object.keys(buildArgs).length > 0) {
            object.buildArgs = {...buildArgs};
        }

        if(env && Object.keys(env).length > 0) {
            object.env = {...env};
        }

        if(volumes && volumes.length > 0) {
            object.volumes = [...volumes];
        }

        if(ports && ports.length > 0) {
            object.ports = [...ports];
        }

        return object;
    }
}

export namespace ServiceConfig {
    export type Data = {
        type?: "compose" | "plugin";
        image?: string;
        containerName?: string;
        buildArgs?: EnvConfig;
        env?: EnvConfig;
        ports?: string[];
        volumes?: string[];
    };
}
