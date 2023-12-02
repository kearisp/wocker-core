import {EnvConfig} from "./EnvConfig";


export type AppConfig = {
    debug?: boolean;
    meta: EnvConfig;
    env: EnvConfig;
    plugins: string[];
    projects: {
        id: string;
        name?: string;
        src: string;
    }[];
};
