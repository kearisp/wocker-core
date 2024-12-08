import {describe, it, expect, beforeEach} from "@jest/globals";
import {Logger} from "@kearisp/cli";

import {AppConfig, AppConfigProperties} from "./AppConfig";
import {PRESET_SOURCE_EXTERNAL, PRESET_SOURCE_INTERNAL} from "./Preset";


describe("Config", (): void => {
    beforeEach((): void => {
        Logger.debug("-----------");
        Logger.mute();
    });

    class TestConfig extends AppConfig {
        public constructor(data: AppConfigProperties) {
            super(data);
        }

        public async save() {
            //
        }
    }

    it("Project", (): void => {
        const config = new TestConfig({});

        expect(config.getProject("test")).toBeUndefined();

        config.addProject("test", "Test", "/test");
        config.addProject("test", "Test-2", "/test-2");

        expect(config.projects).toEqual([
            {id: "test", name: "Test-2", path: "/test-2"}
        ]);
        expect(config.getProject("test")).toEqual({id: "test", name: "Test-2", path: "/test-2"});

        config.removeProject("test");

        expect(config.projects).toEqual(undefined);

        config.removeProject("test-2");

        expect(config.projects).toEqual(undefined);
    });

    it("Plugin", (): void => {
        const config = new TestConfig({});

        const PLUGIN_1 = "test-1";

        config.addPlugin(PLUGIN_1);
        config.addPlugin(PLUGIN_1);

        expect(config.plugins).toEqual([PLUGIN_1]);

        config.removePlugin(PLUGIN_1);
        config.removePlugin(PLUGIN_1);

        expect(config.plugins).toEqual(undefined);
    });

    it("Preset", (): void => {
        const config = new TestConfig({});

        config.registerPreset("test", PRESET_SOURCE_EXTERNAL, "/test");

        expect(config.presets).toEqual([
            {name: "test", source: PRESET_SOURCE_EXTERNAL, path: "/test"}
        ]);

        config.registerPreset("test", PRESET_SOURCE_INTERNAL);

        expect(config.presets).toEqual([
            {name: "test", source: PRESET_SOURCE_INTERNAL}
        ]);

        config.unregisterPreset("test");
        config.registerPreset("test", PRESET_SOURCE_INTERNAL);
        config.unregisterPreset("test");
        config.unregisterPreset("test");

        expect(config.presets).toBeUndefined();
    });

    it("Meta", (): void => {
        const config = new TestConfig({});

        config.setMeta("TEST", "1");
        config.unsetMeta("TEST-2");

        expect(config.meta).toEqual({
            TEST: "1"
        });
        expect(config.getMeta("TEST")).toEqual("1");
        expect(config.getMeta("TEST-2", "default")).toEqual("default");
        expect(config.hasMeta("TEST")).toBeTruthy();

        config.unsetMeta("TEST");

        expect(config.meta).toBeUndefined();
    });

    it("Env", (): void => {
        const config = new TestConfig({});

        config.setEnv("TEST", "value");

        expect(config.env).toEqual({
            TEST: "value"
        });
        expect(config.getEnv("TEST")).toEqual("value");
        expect(config.getEnv("TEST-2", "default")).toEqual("default");

        config.unsetEnv("TEST-2");
        config.unsetEnv("TEST");
        expect(config.env).toBeUndefined();
    });

    it("toJson", (): void => {
        const config = new TestConfig({});

        expect(config.toJson()).toEqual({
            logLevel: "off"
        });
    });
});
