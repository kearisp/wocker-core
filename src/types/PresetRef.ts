import {PresetSource} from "../makes/Preset";


export type PresetRef = {
    name: string;
    source: PresetSource;
    path?: string;
};
