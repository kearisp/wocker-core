import {
    readFile,
    writeFile,
    PathOrFileDescriptor
} from "fs";


class FS {
    static async readJSON(filePath: PathOrFileDescriptor): Promise<any> {
        const res: Buffer = await new Promise((resolve, reject) => {
            readFile(filePath, (err, data) => {
                if(err) {
                    reject(err);

                    return;
                }

                resolve(data);
            });
        });

        return JSON.parse(res.toString());
    }

    static async writeJSON(filePath: PathOrFileDescriptor, data: any): Promise<void> {
        const json = JSON.stringify(data, null, 4);

        return new Promise((resolve, reject) => {
            writeFile(filePath, json, (err) => {
                if(err) {
                    reject(err);

                    return;
                }

                resolve(undefined);
            });
        });
    }
}


export {FS};
