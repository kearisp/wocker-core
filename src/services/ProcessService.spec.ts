import {describe, it, expect, jest, beforeEach} from "@jest/globals";
import Path from "path";
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
});
