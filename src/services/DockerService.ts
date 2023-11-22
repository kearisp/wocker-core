import {Container} from "dockerode";


namespace DockerServiceParams {
    export type CreateContainer = {
        name: string;
        image: string;
        restart?: "always";
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
}


abstract class DockerService {
    public abstract createContainer(params: DockerServiceParams.CreateContainer): Promise<Container>;
    public abstract getContainer(name: string): Promise<Container|null>;
    public abstract removeContainer(name: string): Promise<void>;
    public abstract buildImage(params: DockerServiceParams.BuildImage): Promise<any>;
    public abstract imageExists(tag: string): Promise<boolean>;
    public abstract imageRm(tag: string): Promise<void>;
    public abstract pullImage(tag: string): Promise<void>;
    public abstract attachStream(stream: NodeJS.ReadWriteStream): Promise<void>;
}

export {
    DockerService,
    DockerServiceParams
};
