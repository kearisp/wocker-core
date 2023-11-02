import {EnvConfig} from "./EnvConfig";


export type AppConfig = {
    debug?: boolean;
    env: EnvConfig;
    projects: {
        id: string;
        name?: string;
        src: string;
    }[];
};
