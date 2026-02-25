import type Docker from "dockerode";
import type {Container, ContainerInfo} from "dockerode";
import {Injectable} from "../../../decorators";


@Injectable("DOCKER_CONTAINER_SERVICE")
export abstract class ContainerService {
    public abstract get docker(): Docker;
    public abstract create(params: ContainerService.CreateParams): Promise<Container>;
    public abstract get(name: string | string[]): Promise<Container | null>;
    public abstract list(params: ContainerService.ListParams): Promise<ContainerInfo[]>;
}

export namespace ContainerService {
    export type CreateParams = {
        name: string;
        labels?: {
            [key: string]: string;
        };
        image: string;
        user?: string;
        restart?: "always";
        entrypoint?: string | string[];
        /** @deprecated */
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

    export type ListParams = {
        all?: boolean;
        name?: string | string[];
    } | undefined;

    export type ExecParams = string[] | {
        cmd: string[];
        tty?: boolean;
        user?: string;
    };
}
