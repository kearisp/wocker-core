import {describe, it, expect, beforeAll, afterEach} from "@jest/globals";
import {Logger} from "@kearisp/cli";
import {isPathAllowed} from "./isPathAllowed";


describe("isPathAllowed", (): void => {
    beforeAll((): void => {
        Logger.mute();
    });

    afterEach((): void => {
        Logger.debug("-".repeat(10));
        Logger.mute();
    });

    it("should allow an exact match", (): void => {
        expect(isPathAllowed("/home/user", ["/home/user"])).toBeTruthy();
    });

    it("should allow a subpath of an allowed path", (): void => {
        expect(isPathAllowed("/home/user/project", ["/home/user"])).toBeTruthy();
    });

    it("should not allow a sibling path with a shared prefix", (): void => {
        expect(isPathAllowed("/home/user2", ["/home/user"])).toBeFalsy();
        expect(isPathAllowed("/home/user2/project", ["/home/user"])).toBeFalsy();
    });

    it("should let deny override allow", (): void => {
        expect(isPathAllowed("/home/user/.ssh", ["/home/user"], ["/home/user/.ssh"])).toBeFalsy();
        expect(isPathAllowed("/home/user/.ssh/id_rsa", ["/home/user"], ["/home/user/.ssh"])).toBeFalsy();
        expect(isPathAllowed("/home/user/project", ["/home/user"], ["/home/user/.ssh"])).toBeTruthy();
    });

    it("should deny everything when both lists are empty", (): void => {
        expect(isPathAllowed("/home/user")).toBeFalsy();
        expect(isPathAllowed("/home/user", [])).toBeFalsy();
    });
});
