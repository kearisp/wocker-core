export type ProjectOldRef = {
    /**
     * @deprecated
     */
    id?: string;
    name?: string;
    path?: string;
    /**
     * @deprecated
     */
    src?: string;
};

export type ProjectRef = {
    name: string;
    path: string;
};
