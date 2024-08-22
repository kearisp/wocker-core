import {Volume} from "../types";


export const volumeFormat = (volume: Volume) => {
    const {
        source,
        destination,
        options
    } = volume;

    return `${source}:${destination}` + (options ? `:${options}` : "");
};
