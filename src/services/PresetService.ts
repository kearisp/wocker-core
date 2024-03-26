import {EnvConfig} from "../types";


type SearchOptions = Partial<{
    name: string;
}>;

abstract class PresetService {
    public abstract getImageName(preset: any, buildArgs?: EnvConfig): string;
    public abstract save(preset: any): Promise<void>;
    public abstract get(name: string): Promise<any|null>;
    public abstract search(options?: SearchOptions): Promise<any[]>;

    public async searchOne(options?: SearchOptions): Promise<any|null|undefined> {
        const [preset] = await this.search(options);

        return preset || null;
    }
}


export {
    PresetService,
    SearchOptions as PresetServiceSearchOptions
};

