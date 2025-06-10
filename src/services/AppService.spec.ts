import {describe, it, expect, beforeEach} from "@jest/globals";
import {vol} from "memfs";
import {Module} from "../decorators";
import {Factory} from "../core";
import {AppService} from "./AppService";
import {AppFileSystemService} from "./AppFileSystemService";
import {LogService} from "./LogService";
import {DATA_DIR, WOCKER_DATA_DIR_KEY, WOCKER_VERSION_KEY} from "../env";
import {ProcessService} from "./ProcessService";
import {AppConfigService} from "./AppConfigService";


describe("AppService", (): void => {
    beforeEach((): void => {
        vol.reset();
    });

    const getContext = async (version: string = "1.0.0") => {
        @Module({
            providers: [
                {
                    provide: WOCKER_VERSION_KEY,
                    useValue: version
                },
                {
                    provide: WOCKER_DATA_DIR_KEY,
                    useValue: DATA_DIR
                },
                AppService,
                AppConfigService,
                AppFileSystemService,
                LogService,
                ProcessService
            ]
        })
        class TestModule {}

        const context = await Factory.create(TestModule);

        return {
            appService: context.get(AppService),
            fs: context.get(AppFileSystemService)
        };
    };

    it("should return correct application version from WOCKER_VERSION constant", async (): Promise<void> => {
        const {appService} = await getContext();

        expect(appService.version).toBe("1.0.0");
    });

    it("should correctly compare versions using isVersionGTE", async (): Promise<void> => {
        const {appService} = await getContext("1.0.24");

        expect(appService.isVersionGTE("0.0.-1")).toBeTruthy();
        expect(appService.isVersionGTE("0.0.0")).toBeTruthy();
        expect(appService.isVersionGTE("1.0.23")).toBeTruthy();
        expect(appService.isVersionGTE("1.0.24")).toBeTruthy();
        expect(appService.isVersionGTE("1.0.25")).toBeFalsy();
    });
});
