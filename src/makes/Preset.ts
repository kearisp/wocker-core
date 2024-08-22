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
    public id: string;
    public name: string;
    public version: string;
    public dockerfile?: string;
    public buildArgsOptions?: {
        [name: string]: AnyOption;
    };
    public envOptions?: {
        [name: string]: AnyOption;
    };
    public path: string;
    public volumes?: string[];
    public volumeOptions?: string[];

    protected constructor(data: PresetProperties) {
        this.id = data.id;
        this.name = data.name;
        this.path = data.path;
        this.version = data.version;
        this.dockerfile = data.dockerfile;
        this.buildArgsOptions = data.buildArgsOptions;
        this.envOptions = data.envOptions;
        this.volumes = data.volumes;
        this.volumeOptions = data.volumeOptions;
    }

    public abstract save(): Promise<void>;
}
