import {PickProperties, PresetSource} from "../../../types";


export type PresetVariableCondition = {
    variable: string;
    equals?: string;
    notEquals?: string;
    in?: string[];
    notIn?: string[];
    contains?: string;
    includes?: string | string[];
};

type BaseVariableConfig = {
    when?: PresetVariableCondition;
};

type TextOption = BaseVariableConfig & {
    type: "text" | "string" | "number" | "int" | "password";
    message?: string;
    default?: string | number;
};

type ConfirmOption = BaseVariableConfig & {
    type: "boolean";
    message?: string;
    required?: boolean;
    default?: boolean;
};

export type PresetSelectMode = "flags" | "variable";

type SelectOption = BaseVariableConfig & {
    type: "select";
    required?: boolean;
    multiple?: boolean;
    mode?: PresetSelectMode;
    delimiter?: string;
    options: string[]|{label?: string; value: string}[]|{[name: string]: string};
    message?: string;
    default?: string;
};

export type PresetVariableConfig = TextOption | ConfirmOption | SelectOption;

export type PresetProperties = PickProperties<Preset>;

export abstract class Preset {
    public name: string;
    public version: string;
    public source?: PresetSource;
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
