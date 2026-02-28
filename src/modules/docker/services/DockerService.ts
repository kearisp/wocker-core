import type Docker from "dockerode";
import type {Container, ContainerInfo, ImageInfo, VolumeCreateResponse} from "dockerode";
import {Duplex} from "node:stream";
import {Injectable} from "../../../decorators";
import {ContainerService} from "./ContainerService";


@Injectable("DOCKER_SERVICE")
export abstract class DockerService {
    public abstract get docker(): Docker;
    public abstract createContainer(params: DockerService.CreateContainerParams): Promise<Container>;
    public abstract getContainer(name: string | string[]): Promise<Container | null>;
    public abstract listContainer(params: DockerService.ListContainerParams): Promise<ContainerInfo[]>;
    public abstract removeContainer(name: string): Promise<void>;
    public abstract createVolume(name: string): Promise<VolumeCreateResponse>;
    public abstract hasVolume(name: string): Promise<boolean>;
    public abstract rmVolume(name: string): Promise<void>;
    public abstract buildImage(params: DockerService.BuildImageParams): Promise<any>;
    public abstract imageLs(options?: DockerService.ImageLSOptions): Promise<ImageInfo[]>;
    public abstract imageExists(tag: string): Promise<boolean>;
    public abstract imageRm(tag: string, force?: boolean): Promise<void>;
    public abstract pullImage(tag: string): Promise<void>;
    public abstract attach(name: string | Container): Promise<NodeJS.ReadWriteStream | null | undefined>;
    public abstract attachStream(stream: NodeJS.ReadWriteStream): Promise<NodeJS.ReadWriteStream>;
    public abstract exec(name: string, command?: DockerService.ExecParams, tty?: boolean): Promise<Duplex | null>;
    public abstract logs(containerOrName: DockerService.ContainerOrName, params?: DockerService.LogsParams): Promise<NodeJS.ReadableStream | null| undefined>;
}

export namespace DockerService {
    export type CreateContainerParams = ContainerService.CreateParams;

    export type ListContainerParams = ContainerService.ListParams;

    export type BuildImageParams = {
        version?: "1" | "2";
        tag: string;
        buildArgs?: {
            [key: string]: string;
        };
        labels?: {
            [key: string]: string;
        };
        context: string | string[];
    } & ({
        /** @deprecated */
        src: string;
    } | {
        dockerfile: string;
    });

    export type ExecParams = ContainerService.ExecParams;

    export type ImageLSOptions = {
        tag?: string;
        reference?: string[];
        labels?: {
            [key: string]: string;
        };
    };

    export type ContainerOrName = ContainerService.ContainerOrName;
    export type LogsParams = ContainerService.LogsParams;
}

export namespace DockerServiceParams {
    /** @deprecated */
    export type CreateContainer = DockerService.CreateContainerParams;

    /** @deprecated */
    export type ImageList = DockerService.ImageLSOptions;

    export type BuildImage = DockerService.BuildImageParams;

    /** @deprecated */
    export type Exec = DockerService.ExecParams;
}
