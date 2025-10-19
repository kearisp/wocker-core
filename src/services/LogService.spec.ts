import {describe, it, jest, expect, beforeEach} from "@jest/globals";
import {vol} from "memfs";
import {Global, Module} from "../decorators";
import {Factory, ApplicationContext} from "../core";
import {AppFileSystemService} from "./AppFileSystemService";
import {LogService} from "./LogService";
import {AppConfigService} from "./AppConfigService";
import {ProcessService} from "./ProcessService";
import {WOCKER_DATA_DIR, WOCKER_DATA_DIR_KEY, WOCKER_VERSION_KEY, FILE_SYSTEM_DRIVER_KEY} from "../env";


describe("LogService", (): void => {
    let context: ApplicationContext;

    beforeEach(async (): Promise<void> => {
        vol.reset();
        vol.fromJSON({
            "wocker.config.json": JSON.stringify({
                debug: true
            })
        }, WOCKER_DATA_DIR);

        @Global()
        @Module({
            providers: [
                {
                    provide: WOCKER_VERSION_KEY,
                    useValue: "1.0.0"
                },
                {
                    provide: WOCKER_DATA_DIR_KEY,
                    useValue: WOCKER_DATA_DIR
                },
                {
                    provide: FILE_SYSTEM_DRIVER_KEY,
                    useValue: vol
                },
                AppConfigService,
                AppFileSystemService,
                LogService,
                ProcessService
            ]
        })
        class TestModule {}

        context = await Factory.create(TestModule);
    });

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
        const logService = context.get(LogService),
              fs = context.get(AppFileSystemService);

        expect(fs.exists("ws.log")).toBeFalsy();

        const spy = jest.spyOn(logService as any, "_log");

        logService[method](message);

        expect(spy).toHaveBeenCalled();
        expect(fs.exists("ws.log")).toBeTruthy();
        expect(fs.readFile("ws.log").toString()).toContain(`${method}: ${message}`);
    });

    it("should clear log file content", async (): Promise<void> => {
        const logService = context.get(LogService),
              fs = context.get(AppFileSystemService);

        logService.info("Foo bar");

        expect(fs.readFile("ws.log").toString()).not.toBe("");

        logService.clear();

        expect(fs.readFile("ws.log").toString()).toBe("");
    });
});
