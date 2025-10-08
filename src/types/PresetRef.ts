import {PresetSource} from "./PresetSource";


export type PresetRef = {
    name: string;
    source: PresetSource;
    path?: string;
};
