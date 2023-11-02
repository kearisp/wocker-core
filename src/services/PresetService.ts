import {Preset} from "../models/Preset";
import {EnvConfig} from "../types/EnvConfig";


type SearchOptions = Partial<{
    name: string;
}>;

abstract class PresetService {
    public abstract getImageName(preset: Preset, buildArgs?: EnvConfig): string;
    public abstract save(preset: Preset): Promise<void>;
    public abstract get(name: string): Promise<Preset|null>;
    public abstract search(options?: SearchOptions): Promise<Preset[]>;

    public async searchOne(options?: SearchOptions): Promise<Preset|null|undefined> {
        const [preset] = await this.search(options);

        return preset || null;
    }
}


export {
    PresetService,
    SearchOptions as PresetServiceSearchOptions
};
