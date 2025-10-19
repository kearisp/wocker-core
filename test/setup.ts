import {jest} from "@jest/globals";
import * as fs from "fs";
import {vol} from "memfs";
import {Union} from "unionfs";


const WOCKER_DATA_DIR = "/home/wocker-test/.workspace";

const ufs = (new Union()).use(vol as any).use(fs),
      reset = vol.reset.bind(vol);

jest.spyOn(vol, "reset").mockImplementation(() => {
    reset();

    vol.mkdirSync(WOCKER_DATA_DIR, {
        recursive: true
    });
});

jest.doMock("fs", () => ufs);
jest.doMock("fs/promises", () => ufs.promises);

jest.mock("../src/env", () => {
    const env: any = jest.requireActual("../src/env");

    return {
        ...env,
        WOCKER_DATA_DIR
    };
});

jest.doMock(`${WOCKER_DATA_DIR}/wocker.config.js`, () => {
    return {
        get config() {
            const file = vol.readFileSync(`${WOCKER_DATA_DIR}/wocker.config.js`).toString();

            return eval(file);
        }
    };
}, {
    virtual: true
});
