import {describe, it, expect} from "@jest/globals";
import {AppConfig} from "./AppConfig";
import {PRESET_SOURCE_EXTERNAL, PRESET_SOURCE_INTERNAL} from "./Preset";


describe("AppConfig", (): void => {
    it("should correctly manage project operations", (): void => {
        const config = new AppConfig({});

        expect(config.getProject("test")).toBeUndefined();

        config.addProject("test", "Test", "/test");
        config.addProject("test", "Test-2", "/test-2");

        expect(config.projects).toEqual([
            {name: "Test", path: "/test"},
            {name: "Test-2", path: "/test-2"}
        ]);
        expect(config.getProject("Test-2")).toEqual({name: "Test-2", path: "/test-2"});

        config.removeProject("Test");
        config.removeProject("Test-2");

        expect(config.projects).toEqual([]);
    });

    it("should handle plugin operations correctly", (): void => {
        const config = new AppConfig({});

        const PLUGIN_1 = "test-1",
              PLUGIN_2 = "test-2";

        config.addPlugin(PLUGIN_1);
        config.addPlugin(PLUGIN_1);

        expect(config.plugins).toEqual([{name: PLUGIN_1, env: "latest"}]);

        config.addPlugin(PLUGIN_2, "beta");

        expect(config.plugins).toEqual([
            {name: PLUGIN_1, env: "latest"},
            {name: PLUGIN_2, env: "beta"}
        ]);

        config.removePlugin(PLUGIN_1);

        expect(config.plugins).toEqual([
            {name: PLUGIN_2, env: "beta"}
        ]);

        config.removePlugin(PLUGIN_2);

        expect(config.plugins).toEqual([]);
    });

    it("should manage preset registration and unregistration properly", (): void => {
        const config = new AppConfig({});

        config.registerPreset("test", PRESET_SOURCE_EXTERNAL, "/test");

        expect(config.presets).toEqual([
            {name: "test", source: PRESET_SOURCE_EXTERNAL, path: "/test"}
        ]);

        config.registerPreset("test", PRESET_SOURCE_INTERNAL);

        expect(config.presets).toEqual([
            {name: "test", source: PRESET_SOURCE_EXTERNAL, path: "/test"}
        ]);

        config.unregisterPreset("test");
        config.registerPreset("test", PRESET_SOURCE_INTERNAL);
        config.unregisterPreset("test");
        config.unregisterPreset("test");

        expect(config.presets).toEqual([]);
    });

    it("should handle metadata operations correctly", (): void => {
        const config = new AppConfig({});

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

    it("should manage environment variables properly", (): void => {
        const config = new AppConfig({});

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

    it("should serialize config to object correctly", (): void => {
        const config = new AppConfig({});

        expect(config.toObject()).toEqual({
            logLevel: "off"
        });
    });
});
