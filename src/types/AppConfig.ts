import {EnvConfig} from "./EnvConfig";


export type AppConfig = {
    debug?: boolean;
    env: EnvConfig;
    plugins: string[];
    projects: {
        id: string;
        name?: string;
        src: string;
    }[];
};
