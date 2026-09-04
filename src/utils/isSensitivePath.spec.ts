import {describe, it, expect, beforeAll, afterEach} from "@jest/globals";
import {Logger} from "@kearisp/cli";
import OS from "os";
import Path from "path";
import {isSensitivePath} from "./isSensitivePath";


describe("isSensitivePath", (): void => {
    beforeAll((): void => {
        Logger.mute();
    });

    afterEach((): void => {
        Logger.debug("-".repeat(10));
        Logger.mute();
    });

    it("should treat the filesystem root as sensitive", (): void => {
        expect(isSensitivePath(Path.parse(Path.resolve("/")).root)).toBeTruthy();
    });

    it("should treat a direct child of root as sensitive", (): void => {
        expect(isSensitivePath("/etc")).toBeTruthy();
        expect(isSensitivePath("/root")).toBeTruthy();
        expect(isSensitivePath("/home")).toBeTruthy();
    });

    it("should not treat a deeper path as sensitive", (): void => {
        expect(isSensitivePath("/etc/nginx")).toBeFalsy();
        expect(isSensitivePath("/home/wocker-test/projects/foo")).toBeFalsy();
    });

    it("should treat the user's home directory as sensitive", (): void => {
        expect(isSensitivePath(OS.homedir())).toBeTruthy();
    });

    it("should not treat a non-home deep path as sensitive", (): void => {
        expect(isSensitivePath("/opt/some/deep/path")).toBeFalsy();
    });
});
