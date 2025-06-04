import {jest} from "@jest/globals";
import * as fs from "fs";
import {vol} from "memfs";
import {Union} from "unionfs";


// const ufs = new Union(),
//       reset = vol.reset.bind(vol);

// ufs.use(vol as any).use(fs);

// vol.reset = (): void => {
//     reset();
//
//     vol.mkdirSync("/home/wocker-test", {
//         recursive: true
//     });
// };

// jest.doMock("fs", () => ufs);
// jest.doMock("fs/promises", () => ufs.promises);
