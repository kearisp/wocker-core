import {Container, ImageInfo, VolumeCreateResponse} from "dockerode";
import {Injectable} from "../decorators";
import {Duplex} from "node:stream";


export namespace DockerServiceParams {
    export type CreateContainer = {
        name: string;
        image: string;
        user?: string;
        restart?: "always";
        entrypoint?: string | string[];
        projectId?: string;
        tty?: boolean;
        ulimits?: {
            [key: string]: {
                hard?: number;
                soft?: number;
            };
        };
        links?: string[];
        env?: {
            [key: string]: string;
        };
        networkMode?: string;
        extraHosts?: any;
        volumes?: string[];
        ports?: string[];
        cmd?: string[];
    };

    export type ImageList = {
        tag?: string;
        reference?: string[];
        labels?: {
            [key: string]: string;
        };
    };

    export type BuildImage = {
        tag: string;
        buildArgs?: {
            [key: string]: string;
        };
        labels?: {
            [key: string]: string;
        };
        context: string;
        src: string;
    };

    export type Exec = {
        cmd: string[];
        tty?: boolean;
    };
}

@Injectable("DOCKER_SERVICE")
export abstract class DockerService {
    public abstract createContainer(params: DockerServiceParams.CreateContainer): Promise<Container>;
    public abstract getContainer(name: string): Promise<Container|null>;
    public abstract removeContainer(name: string): Promise<void>;
    public abstract createVolume(name: string): Promise<VolumeCreateResponse>;
    public abstract hasVolume(name: string): Promise<boolean>;
    public abstract rmVolume(name: string): Promise<void>;
    public abstract buildImage(params: DockerServiceParams.BuildImage): Promise<any>;
    public abstract imageExists(tag: string): Promise<boolean>;
    public abstract imageLs(options?: DockerServiceParams.ImageList): Promise<ImageInfo[]>;
    public abstract imageRm(tag: string, force?: boolean): Promise<void>;
    public abstract pullImage(tag: string): Promise<void>;
    public abstract attach(name: string|Container): Promise<NodeJS.ReadWriteStream>;
    public abstract attachStream(stream: NodeJS.ReadWriteStream): Promise<void>;
    public abstract exec(name: string, command?: DockerServiceParams.Exec|string[], tty?: boolean): Promise<Duplex>;
    public abstract logs(containerOrName: string|Container): Promise<NodeJS.ReadableStream>;
}
