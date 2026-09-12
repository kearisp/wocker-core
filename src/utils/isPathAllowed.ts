import Path from "path";


export const isPathAllowed = (target: string, allow: string[] = [], deny: string[] = []): boolean => {
    const matches = (list: string[]): boolean => list.some((entry) => {
        const normalized = Path.resolve(entry);

        return target === normalized || target.startsWith(normalized + Path.sep);
    });

    if(matches(deny)) {
        return false;
    }

    return matches(allow);
};
