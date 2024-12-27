import {jest} from "@jest/globals";
import {vol} from "memfs";


jest.mock("fs", () => vol);
jest.mock("fs/promises", () => vol.promises);
