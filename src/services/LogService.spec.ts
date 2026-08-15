import {describe, it, jest, expect, beforeEach} from "@jest/globals";
import {vol} from "memfs";
import {Module} from "../decorators";
import {Factory, ApplicationContext} from "../core";
import {AppFileSystemService} from "./AppFileSystemService";
import {LogService} from "./LogService";
import {ProcessService} from "./ProcessService";
import {FileSystemDriver, LogLevel} from "../types";
import {WOCKER_DATA_DIR} from "../env";


describe("LogService", (): void => {
    let context: ApplicationContext;

    beforeEach(async (): Promise<void> => {
        vol.reset();
        vol.fromJSON({
            "wocker.config.json": JSON.stringify({
                debug: true
            })
        }, WOCKER_DATA_DIR);

        @Module({})
        class TestModule {}

        context = await Factory.create(TestModule, {
            fsDriver: vol as unknown as FileSystemDriver
        });
    });

    it.each<{
        method: LogLevel;
        message: string;
    }>([
        {
            method: LogLevel.LOG,
            message: "Default log"
        },
        {
            method: LogLevel.INFO,
            message: "Info"
        },
        {
            method: LogLevel.WARNING,
            message: "Warning"
        },
        {
            method: LogLevel.DEBUG,
            message: "Debug"
        },
        {
            method: LogLevel.ERROR,
            message: "Error"
        }
    ])("should write $method message to log file", async ({method, message}): Promise<void> => {
        const processService = context.get(ProcessService),
              logService = context.get(LogService),
              fs = context.get(AppFileSystemService);

        processService.setEnv("WS_LOG_LEVEL", LogLevel.DEBUG);

        expect(fs.exists("ws.log")).toBeFalsy();

        const spy = jest.spyOn(logService as any, "_log");

        logService[method](message);

        expect(spy).toHaveBeenCalled();
        expect(fs.exists("ws.log")).toBeTruthy();
        expect(fs.readFile("ws.log").toString()).toContain(`${method}: ${message}`);
    });

    it.each([
        {
            method: LogLevel.INFO,
            level: LogLevel.ERROR
        }
    ])("shouldn't write $method message to log file", async ({method, level}): Promise<void> => {
        const processService = context.get(ProcessService),
              logService = context.get(LogService),
              fs = context.get(AppFileSystemService);

        processService.setEnv("WS_LOG_LEVEL", level);

        expect(fs.exists("ws.log")).toBeFalsy();

        const methodMessage = `Some ${method}`,
              levelMessage = `Level ${level} message`;

        logService[level](levelMessage);
        logService[method](methodMessage);

        expect(fs.exists("ws.log")).toBeTruthy();
        expect(fs.readFile("ws.log").toString()).not.toContain(methodMessage);
        expect(fs.readFile("ws.log").toString()).toContain(levelMessage);
    });

    it("should escape newlines so a multiline message stays on one physical log line", async (): Promise<void> => {
        const processService = context.get(ProcessService),
              logService = context.get(LogService),
              fs = context.get(AppFileSystemService);

        processService.setEnv("WS_LOG_LEVEL", LogLevel.INFO);

        logService.info("line1\nline2\nline3");

        const rawLines = fs.readFile("ws.log").toString().split("\n").filter(Boolean);

        expect(rawLines).toHaveLength(1);
        expect(rawLines[0]).toContain("line1\\nline2\\nline3");
    });

    it("should escape backslashes so they survive alongside escaped newlines", async (): Promise<void> => {
        const processService = context.get(ProcessService),
              logService = context.get(LogService),
              fs = context.get(AppFileSystemService);

        processService.setEnv("WS_LOG_LEVEL", LogLevel.INFO);

        logService.info("C:\\Users\\test");

        const content = fs.readFile("ws.log").toString();

        expect(content).toContain("C:\\\\Users\\\\test");
    });

    it("should clear log file content", async (): Promise<void> => {
        const processService = context.get(ProcessService),
              logService = context.get(LogService),
              fs = context.get(AppFileSystemService);

        processService.setEnv("WS_LOG_LEVEL", LogLevel.INFO);

        logService.info("Foo bar");

        expect(fs.readFile("ws.log").toString()).not.toBe("");

        logService.clear();

        expect(fs.readFile("ws.log").toString()).toBe("");
    });
});
