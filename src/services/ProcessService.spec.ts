import {describe, it, expect, jest, beforeEach} from "@jest/globals";
import Path from "path";
import Readline from "readline";
import {Factory} from "../core";
import {Module} from "../decorators";
import {ProcessService} from "./ProcessService";


describe("ProcessService", () => {
    let processService: ProcessService;

    beforeEach(async () => {
        @Module({})
        class TestModule {}

        const context = await Factory.create(TestModule);

        processService = context.get(ProcessService);
    });

    describe("pwd", () => {
        it("should return current directory", () => {
            expect(processService.pwd()).toBe(process.cwd());
        });

        it("should return path joined with current directory", () => {
            const subPath = "test-path";

            expect(processService.pwd(subPath)).toBe(Path.join(process.cwd(), subPath));
        });
    });

    describe("chdir", () => {
        it("should call process.chdir", () => {
            const spy = jest.spyOn(process, "chdir").mockImplementation(() => undefined),
                  testPath = "/test/path";

            processService.chdir(testPath);

            expect(spy).toHaveBeenCalledWith(testPath);

            spy.mockRestore();
        });
    });

    describe("cd", () => {
        it("should call chdir with absolute path", () => {
            const spy = jest.spyOn(processService, "chdir").mockImplementation(() => undefined),
                  testPath = "/absolute/path";

            processService.cd(testPath);

            expect(spy).toHaveBeenCalledWith(testPath);

            spy.mockRestore();
        });

        it("should call chdir with relative path", () => {
            const spy = jest.spyOn(processService, "chdir").mockImplementation(() => undefined),
                  testPath = "relative/path";

            processService.cd(testPath);

            expect(spy).toHaveBeenCalledWith(Path.join(process.cwd(), testPath));

            spy.mockRestore();
        });
    });

    describe("write", () => {
        it("should call process.stdout.write", () => {
            const spy = jest.spyOn(process.stdout, "write").mockImplementation(() => true),
                  chunk = "test output";

            processService.write(chunk);

            expect(spy).toHaveBeenCalledWith(chunk);

            spy.mockRestore();
        });
    });

    describe("setEnv", () => {
        it("should set variable to process.env", () => {
            const KEY = "TEST",
                  KEY_2 = "TEST_2",
                  VALUE = "bar";

            processService.setEnv(KEY, VALUE);

            expect(process.env).toEqual(
                expect.objectContaining({
                    [KEY]: VALUE
                })
            );

            expect(process.env).not.toHaveProperty(KEY_2);

            expect(processService.getEnv(KEY)).toBe(VALUE);
            expect(processService.getEnv(KEY_2, VALUE)).toBe(VALUE);
        });
    });

    describe("UID", () => {
        it("should return process.getuid if available", () => {
            if(process.getuid) {
                expect(processService.UID).toBe(`${process.getuid()}`);
            }
            else {
                expect(processService.UID).toBeUndefined();
            }
        });

        it("should return undefined if process.getuid is not available", () => {
            const originalGetuid = process.getuid;

            delete process.getuid;

            expect(processService.UID).toBeUndefined();

            process.getuid = originalGetuid;
        });
    });

    describe("GID", () => {
        it("should return process.getgid if available", () => {
            if(process.getgid) {
                expect(processService.GID).toBe(`${process.getgid()}`);
            }
            else {
                expect(processService.GID).toBeUndefined();
            }
        });

        it("should return undefined if process.getgid is not available", () => {
            const originalGetgid = process.getgid;

            delete process.getgid;

            expect(processService.GID).toBeUndefined();

            process.getgid = originalGetgid;
        });
    });

    describe("rows", () => {
        it("should return process.stdout.rows", () => {
            const originalRows = process.stdout.rows;
            (process.stdout as any).rows = 40;

            expect(processService.rows).toBe(40);

            (process.stdout as any).rows = originalRows;
        });
    });

    describe("columns", () => {
        it("should return process.stdout.columns", () => {
            const originalColumns = process.stdout.columns;
            (process.stdout as any).columns = 80;

            expect(processService.columns).toBe(80);

            (process.stdout as any).columns = originalColumns;
        });
    });

    describe("stdin", () => {
        it("should return process.stdin", () => {
            expect(processService.stdin).toBe(process.stdin);
        });
    });

    describe("stdout", () => {
        it("should return process.stdout", () => {
            expect(processService.stdout).toBe(process.stdout);
        });
    });

    describe("stderr", () => {
        it("should return process.stdout (current implementation)", () => {
            expect(processService.stderr).toBe(process.stdout);
        });
    });

    describe("moveCursor", () => {
        it("should call Readline.moveCursor", () => {
            const spy = jest.spyOn(Readline, "moveCursor").mockImplementation(() => true);

            processService.moveCursor(1, 2);

            expect(spy).toHaveBeenCalledWith(process.stdout, 1, 2);

            spy.mockRestore();
        });
    });

    describe("cursorTo", () => {
        it("should call Readline.cursorTo", () => {
            const spy = jest.spyOn(Readline, "cursorTo").mockImplementation(() => true);

            processService.cursorTo(1, 2);

            expect(spy).toHaveBeenCalledWith(process.stdout, 1, 2);

            spy.mockRestore();
        });
    });

    describe("clearLine", () => {
        it("should call Readline.clearLine", () => {
            const spy = jest.spyOn(Readline, "clearLine").mockImplementation(() => true);

            processService.clearLine(1);

            expect(spy).toHaveBeenCalledWith(process.stdout, 1);

            spy.mockRestore();
        });
    });

    describe("saveCursor", () => {
        it("should write save cursor escape sequence to stdout", () => {
            const spy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);

            processService.saveCursor();

            expect(spy).toHaveBeenCalledWith("\x1b[s");

            spy.mockRestore();
        });
    });

    describe("restoreCursor", () => {
        it("should write restore cursor escape sequence to stdout", () => {
            const spy = jest.spyOn(process.stdout, "write").mockImplementation(() => true);

            processService.restoreCursor();

            expect(spy).toHaveBeenCalledWith("\x1b[u");

            spy.mockRestore();
        });
    });
});
