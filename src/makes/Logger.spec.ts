import {describe, it, expect} from "@jest/globals";
import {Global, Module} from "../decorators";
import {AsyncStorage, Scanner, Container} from "../core";
import {AppConfigService} from "../services/AppConfigService";
import {AppService} from "../services/AppService";
import {AppFileSystemService} from "../services/AppFileSystemService";
import {ProcessService} from "../services/ProcessService";
import {LogService} from "../services/LogService";
import {Logger} from "./Logger";
import {WOCKER_DATA_DIR, WOCKER_DATA_DIR_KEY, WOCKER_VERSION_KEY, FILE_SYSTEM_DRIVER_KEY} from "../env";


describe("Logger", (): void => {
    it("should correctly call logging methods", async (): Promise<void> => {
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
                    useValue: () => undefined
                },
                AppService,
                AppConfigService,
                AppFileSystemService,
                ProcessService,
                LogService
            ],
            exports: [
                LogService
            ]
        })
        class TestModule {}

        const container = new Container(),
              scanner = new Scanner(container);

        AsyncStorage.enterWith(container);

        await scanner.scan(TestModule);

        const testModule = container.getModule(TestModule),
              logService = testModule.get<LogService>(LogService);

        logService.log = jest.fn();
        logService.info = jest.fn();
        logService.warn = jest.fn();
        logService.error = jest.fn();

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

        AsyncStorage.exit(() => undefined);
    });
});
