import {describe, it, expect, beforeAll, afterEach} from "@jest/globals";
import {Logger} from "@kearisp/cli";
import {volumeParse} from "./volumeParse";


describe("volumeParse", (): void => {
    beforeAll((): void => {
        Logger.mute();
    });

    afterEach((): void => {
        Logger.debug("-".repeat(10));
        Logger.mute();
    });

    it("should parse volume", (): void => {
        expect(volumeParse("")).toEqual({});
        expect(volumeParse("./test:/test")).toEqual({
            source: "./test",
            destination: "/test"
        });
        expect(volumeParse("./test:/test:rw")).toEqual({
            source: "./test",
            destination: "/test",
            options: "rw"
        });
    });
});
