import {EnvConfig} from "../../../types";
import {ProjectType} from "./ProjectType";
import {ServiceProperties} from "./ServiceProperties";


export type ProjectV1 = {
    name: string;
    type: ProjectType;
    path: string;
    imageName?: string;
    dockerfile?: string;
    composefile?: string;
    preset?: string;
    presetMode?: "global" | "project";
    scripts?: string[];
    services?: {
        [service: string]: ServiceProperties;
    };
    buildArgs?: EnvConfig;
    env?: EnvConfig;
    metadata?: EnvConfig;
    ports?: string[];
    extraHosts?: EnvConfig;
    volumes?: string[];
};
