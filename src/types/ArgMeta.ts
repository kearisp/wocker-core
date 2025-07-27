export type ArgMeta = {
    index: number;
    type: "param" | "option";
    name: string;
    description?: string;
    params: any;
};
