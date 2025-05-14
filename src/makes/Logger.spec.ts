import {describe, it, expect} from "@jest/globals";
import {LogService} from "../services";
import {Logger} from "./Logger";


describe("Logger", (): void=> {
    class TestLogService extends LogService {
        public debug(): void {}
        public log(): void {}
        public info(): void {}
        public warn(): void {}
        public error(): void {}
    }

    it("should correctly call logging methods", (): void => {
        const testLogService = new TestLogService();

        testLogService.log = jest.fn();
        testLogService.info = jest.fn();
        testLogService.warn = jest.fn();
        testLogService.error = jest.fn();

        Logger.install(testLogService);

        Logger.log(">_<");

        expect(testLogService.log).toHaveBeenCalled();
        expect(testLogService.log).toHaveBeenCalledWith(">_<");

        Logger.info(">_< 2");

        expect(testLogService.info).toHaveBeenCalled();
        expect(testLogService.info).toHaveBeenCalledWith(">_< 2");

        Logger.warn(">_< 3");

        expect(testLogService.warn).toHaveBeenCalled();
        expect(testLogService.warn).toHaveBeenCalledWith(">_< 3");

        Logger.error(">_< 4");

        expect(testLogService.error).toHaveBeenCalled();
        expect(testLogService.error).toHaveBeenCalledWith(">_< 4");
    });
});
