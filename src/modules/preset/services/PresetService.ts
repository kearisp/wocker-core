import {EnvConfig} from "../../../types";
import {Preset} from "../makes/Preset";


type SearchOptions = Partial<{
    name: string;
    source: string;
    path: string;
}>;

abstract class PresetService {
    public abstract getImageName(preset: any, buildArgs?: EnvConfig): string;
    public abstract save(preset: any): Promise<void>;
    public abstract get(name: string): Promise<any|null>;
    public abstract search(options?: SearchOptions): Preset[];
    public abstract searchOne(options?: SearchOptions): Preset | null;
}


export {
    PresetService,
    SearchOptions as PresetServiceSearchOptions
};

