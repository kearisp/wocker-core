import {PickProperties} from "../types";


type TextOption = {
    type: "text" | "string" | "number" | "int" | "password";
    message?: string;
    default?: string | number;
};

type ConfirmOption = {
    type: "boolean";
    message?: string;
    required?: boolean;
    default?: boolean;
};

type SelectOption = {
    type: "select";
    required?: boolean;
    multiple?: boolean;
    options: string[]|{label?: string; value: string}[]|{[name: string]: string};
    message?: string;
    default?: string;
};

export type PresetVariableConfig = TextOption | ConfirmOption | SelectOption;

export type PresetProperties = PickProperties<Preset>;

export abstract class Preset {
    public name: string;
    public source?: PresetSource;
    public version: string;
    public type?: string;
    public image?: string;
    public dockerfile?: string;
    public buildArgsOptions?: {
        [name: string]: PresetVariableConfig;
    };
    public envOptions?: {
        [name: string]: PresetVariableConfig;
    };
    public path?: string;
    public volumes?: string[];
    public volumeOptions?: string[];

    protected constructor(data: PresetProperties) {
        this.name = data.name;
        this.version = data.version;
        this.type = data.type;
        this.source = data.source;
        this.path = data.path;
        this.image = data.image;
        this.dockerfile = data.dockerfile;
        this.buildArgsOptions = data.buildArgsOptions;
        this.envOptions = data.envOptions;
        this.volumes = data.volumes;
        this.volumeOptions = data.volumeOptions;
    }

    public abstract save(): void;

    public abstract delete(): void;

    /**
     * @deprecated
     */
    public toJSON(): PresetProperties {
        return this.toObject();
    }

    public toObject(): PresetProperties {
        return {
            name: this.name,
            version: this.version,
            type: this.type,
            image: this.image,
            dockerfile: this.dockerfile,
            buildArgsOptions: this.buildArgsOptions,
            envOptions: this.envOptions,
            volumes: this.volumes,
            volumeOptions: this.volumeOptions
        };
    }
}

export const PRESET_SOURCE_INTERNAL = "internal" as const;
export const PRESET_SOURCE_EXTERNAL = "external" as const;
export const PRESET_SOURCE_GITHUB = "github" as const;

export type PresetSource = typeof PRESET_SOURCE_INTERNAL |
                           typeof PRESET_SOURCE_EXTERNAL |
                           typeof PRESET_SOURCE_GITHUB;
