import {describe, it, expect, beforeEach} from "@jest/globals";
import {vol} from "memfs";
import {Module} from "../decorators";
import {PluginConfigService} from "./PluginConfigService";
import {Factory} from "../core";
import {PLUGIN_DIR_KEY, DATA_DIR, WOCKER_VERSION_KEY, WOCKER_DATA_DIR_KEY} from "../env";
import {AppConfigService} from "./AppConfigService";
import {AppService} from "./AppService";
import {AppFileSystemService} from "./AppFileSystemService";
import {LogService} from "./LogService";
import {ProcessService} from "./ProcessService";


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
                    useValue: DATA_DIR
                },
                {
                    provide: PLUGIN_DIR_KEY,
                    useValue: `${DATA_DIR}/plugins/test`
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

    it("should", async (): Promise<void> => {
        const {pluginConfigService} = await getContext();

        expect(pluginConfigService.fs.path()).toBe(`${DATA_DIR}/plugins/test`);
    });
});
