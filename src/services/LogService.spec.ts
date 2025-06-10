import {describe, it, jest, expect, beforeEach} from "@jest/globals";
import {vol} from "memfs";
import {Factory} from "../core";
import {Module} from "../decorators";
import {AppFileSystemService} from "./AppFileSystemService";
import {LogService} from "./LogService";
import {DATA_DIR, WOCKER_DATA_DIR_KEY} from "../env";


describe("LogService", (): void => {
    beforeEach((): void => {
        vol.reset();
    });

    const getContext = async () => {
        @Module({
            providers: [
                {
                    provide: WOCKER_DATA_DIR_KEY,
                    useValue: DATA_DIR
                },
                AppFileSystemService,
                LogService
            ]
        })
        class TestModule {}

        const context = await Factory.create(TestModule);

        return {
            fs: context.get(AppFileSystemService),
            logService: context.get(LogService)
        };
    };

    it.each<{
        method: "log" | "info" | "warn" | "debug" | "error";
        message: string;
    }>([
        {
            method: "log",
            message: "Default log"
        },
        {
            method: "info",
            message: "Info"
        },
        {
            method: "warn",
            message: "Warning"
        },
        {
            method: "debug",
            message: "Debug"
        },
        {
            method: "error",
            message: "Error"
        }
    ])("should write $method message to log file", async ({method, message}): Promise<void> => {
        const {fs, logService} = await getContext();

        expect(fs.exists("ws.log")).toBeFalsy();

        const spy = jest.spyOn(logService as any, "_log");

        logService[method](message);

        expect(spy).toHaveBeenCalled();
        expect(fs.exists("ws.log")).toBeTruthy();
        expect(fs.readFile("ws.log").toString()).toContain(`${method}: ${message}`);
    });

    it("should clear log file content", async (): Promise<void> => {
        const {fs, logService} = await getContext();

        logService.info("Foo bar");

        expect(fs.readFile("ws.log").toString()).not.toBe("");

        logService.clear();

        expect(fs.readFile("ws.log").toString()).toBe("");
    });
});
