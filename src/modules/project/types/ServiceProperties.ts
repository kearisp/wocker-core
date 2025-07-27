import {EnvConfig} from "../../../types";


export type ServiceProperties = {
    type?: "compose" | "plugin";
    containerName?: string;
    buildArgs?: EnvConfig;
    env?: EnvConfig;
    ports?: string[];
    volumes?: string[];
};
