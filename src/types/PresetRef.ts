import {PresetSource} from "../makes";


export type PresetRef = {
    name: string;
    source: PresetSource;
    path?: string;
};
