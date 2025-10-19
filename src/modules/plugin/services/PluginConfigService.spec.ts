import {describe, it, expect, beforeEach} from "@jest/globals";
import {vol} from "memfs";
import {Module} from "../../../decorators";
import {Factory} from "../../../core";
import {
    AppService,
    AppConfigService,
    AppFileSystemService,
    ProcessService,
    LogService
} from "../../../services";
import {PluginConfigService} from "./PluginConfigService";
import {
    WOCKER_VERSION_KEY,
    WOCKER_DATA_DIR_KEY, WOCKER_DATA_DIR,
    FILE_SYSTEM_DRIVER_KEY,
    PLUGIN_DIR_KEY
} from "../../../env";


describe("PluginConfigService", (): void => {
    beforeEach((): void => {
        vol.reset();
    });

    const getContext = async () => {
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
                    provide: PLUGIN_DIR_KEY,
                    useValue: `${WOCKER_DATA_DIR}/plugins/test`
                },
                {
                    provide: FILE_SYSTEM_DRIVER_KEY,
                    useValue: vol
                },
                AppService,
                AppFileSystemService,
                AppConfigService,
                PluginConfigService,
                LogService,
                ProcessService
            ]
        })
        class TestModule {}

        const context = await Factory.create(TestModule);

        return {
            pluginConfigService: context.get(PluginConfigService)
        };
    };

    it("should return plugin dir", async (): Promise<void> => {
        const {pluginConfigService} = await getContext();

        expect(pluginConfigService.fs.path()).toBe(`${WOCKER_DATA_DIR}/plugins/test`);
    });
});
