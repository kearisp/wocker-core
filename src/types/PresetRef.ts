import {PresetSource} from "./PresetSource";


export type PresetRef = {
    name: string;
    /** @deprecated */
    source?: PresetSource;
    path?: string;
};
