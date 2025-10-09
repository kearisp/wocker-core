import {Option} from "@kearisp/cli";


export type ArgMeta = {
    name: string;
    type: "param" | "option";
    description?: string;
    params: Omit<Option, "name">;
};

export type ArgOldMeta = {
    name: string;
    type: "param" | "option";
    index: number;
    params: Omit<Option, "name">;
};
