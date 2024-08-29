import {PickProperties} from "../types";


type TextOption = {
    type: "string" | "number" | "int";
    message?: string;
    default?: string | number;
};

type ConfirmOption = {
    type: "boolean";
    message?: string;
    default?: boolean;
};

type SelectOption = {
    type: "select";
    options: string[]|{label?: string; value: string}[]|{[name: string]: string};
    message?: string;
    default?: string;
};

type AnyOption = TextOption | ConfirmOption | SelectOption;

export type PresetProperties = PickProperties<Preset>;

export abstract class Preset {
    public name: string;
    public source?: PresetType;
    public version: string;
    public dockerfile?: string;
    public buildArgsOptions?: {
        [name: string]: AnyOption;
    };
    public envOptions?: {
        [name: string]: AnyOption;
    };
    public path?: string;
    public volumes?: string[];
    public volumeOptions?: string[];

    protected constructor(data: PresetProperties) {
        this.name = data.name;
        this.source = data.source;
        this.path = data.path;
        this.version = data.version;
        this.dockerfile = data.dockerfile;
        this.buildArgsOptions = data.buildArgsOptions;
        this.envOptions = data.envOptions;
        this.volumes = data.volumes;
        this.volumeOptions = data.volumeOptions;
    }

    public abstract save(): Promise<void>;

    public abstract delete(): Promise<void>;

    // noinspection JSUnusedGlobalSymbols
    public toJSON(): PresetProperties {
        return {
            name: this.name,
            source: this.source,
            version: this.version,
            dockerfile: this.dockerfile,
            buildArgsOptions: this.buildArgsOptions,
            envOptions: this.envOptions,
            path: this.path,
            volumes: this.volumes,
            volumeOptions: this.volumeOptions
        };
    }
}

export const PRESET_SOURCE_INTERNAL = "internal";
export const PRESET_SOURCE_EXTERNAL = "external";
export const PRESET_SOURCE_GITHUB = "github";

export type PresetType = typeof PRESET_SOURCE_INTERNAL | typeof PRESET_SOURCE_EXTERNAL | typeof PRESET_SOURCE_GITHUB;
