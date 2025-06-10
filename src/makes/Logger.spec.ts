import {describe, it, expect} from "@jest/globals";
import {Module} from "../decorators";
import {Scanner} from "../core";
import {AppService} from "../services/AppService";
import {AppFileSystemService} from "../services/AppFileSystemService";
import {LogService} from "../services/LogService";
import {Logger} from "./Logger";
import {DATA_DIR, WOCKER_DATA_DIR_KEY} from "../env";
import {AppConfigService} from "../services";


describe("Logger", (): void=> {
    it("should correctly call logging methods", (): void => {
        @Module({
            providers: [
                {
                    provide: WOCKER_DATA_DIR_KEY,
                    useValue: DATA_DIR
                },
                AppService,
                AppConfigService,
                AppFileSystemService,
                LogService
            ]
        })
        class TestModule {}

        const scanner = new Scanner()
        scanner.scan(TestModule);

        const testModule = scanner.container.getModule(TestModule),
              logService = testModule.get<LogService>(LogService);

        logService.log = jest.fn();
        logService.info = jest.fn();
        logService.warn = jest.fn();
        logService.error = jest.fn();

        Logger.install(logService);

        Logger.log(">_<");

        expect(logService.log).toHaveBeenCalled();
        expect(logService.log).toHaveBeenCalledWith(">_<");

        Logger.info(">_< 2");

        expect(logService.info).toHaveBeenCalled();
        expect(logService.info).toHaveBeenCalledWith(">_< 2");

        Logger.warn(">_< 3");

        expect(logService.warn).toHaveBeenCalled();
        expect(logService.warn).toHaveBeenCalledWith(">_< 3");

        Logger.error(">_< 4");

        expect(logService.error).toHaveBeenCalled();
        expect(logService.error).toHaveBeenCalledWith(">_< 4");
    });
});
