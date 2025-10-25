import type Docker from "dockerode";
import type {Container, ImageInfo, VolumeCreateResponse} from "dockerode";
import {Duplex} from "node:stream";
import {Injectable} from "../../../decorators";


export namespace DockerServiceParams {
    export type CreateContainer = {
        name: string;
        image: string;
        user?: string;
        restart?: "always";
        entrypoint?: string | string[];
        projectId?: string;
        tty?: boolean;
        memory?: number;
        memorySwap?: number;
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
        network?: string;
        aliases?: string[];
    };

    export type ImageList = {
        tag?: string;
        reference?: string[];
        labels?: {
            [key: string]: string;
        };
    };

    export type BuildImage = {
        version?: "1" | "2";
        tag: string;
        buildArgs?: {
            [key: string]: string;
        };
        labels?: {
            [key: string]: string;
        };
        context: string;
    } & ({
        /** @deprecated */
        src: string;
    } | {
        dockerfile: string;
    });

    export type Exec = {
        cmd: string[];
        tty?: boolean;
        user?: string;
    };
}

@Injectable("DOCKER_SERVICE")
export abstract class DockerService {
    public abstract get docker(): Docker;
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
    public abstract attach(name: string|Container): Promise<NodeJS.ReadWriteStream|null|undefined>;
    public abstract attachStream(stream: NodeJS.ReadWriteStream): Promise<NodeJS.ReadWriteStream>;
    public abstract exec(name: string, command?: DockerServiceParams.Exec|string[], tty?: boolean): Promise<Duplex|null>;
    public abstract logs(containerOrName: string|Container): Promise<NodeJS.ReadableStream|null|undefined>;
}
