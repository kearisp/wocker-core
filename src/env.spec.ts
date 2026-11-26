import {describe, it, expect} from "@jest/globals";
import {WOCKER_VERSION} from "./env";
import {Version, FileSystem} from "./makes";


describe("env", (): void => {
    it("should keep WOCKER_VERSION in sync with package.json version", (): void => {
        const pkg = new FileSystem(__dirname).readJSON("../package.json");

        const {major, minor, patch} = Version.parse(pkg.version);

        expect(WOCKER_VERSION).toBe(`${major}.${minor}.${patch}`);
    });
});
