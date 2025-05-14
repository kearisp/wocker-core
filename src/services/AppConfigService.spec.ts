import {describe, it, expect} from "@jest/globals";
import {AppConfigService} from "./AppConfigService";
import {AppConfig, PRESET_SOURCE_EXTERNAL} from "../makes";


describe("AppConfigService", () => {
    class TestConfigService extends AppConfigService {
        protected _config?: AppConfig;
        protected _pwd: string;

        public constructor() {
            super();

            this._pwd = process.cwd();
        }

        public pwd(...parts: string[]): string {
            return "";
        }

        public setPWD(pwd: string): void {
            this._pwd = pwd;
        }

        public dataPath(): string {
            return "";
        }

        public pluginsPath(): string {
            return "";
        }

        public get config(): AppConfig {
            if(!this._config) {
                this._config = new AppConfig({});
            }

            return this._config;
        }

        public save(): void {}
    }

    it("should return instance of AppConfig when getting config", (): void => {
        const testConfigService = new TestConfigService();

        expect(testConfigService.getConfig()).toBeInstanceOf(AppConfig);
    });

    it("should correctly compare versions using isVersionGTE", (): void => {
        const testConfigService = new TestConfigService();

        expect(testConfigService.isVersionGTE("0.0.-1")).toBeTruthy();
        expect(testConfigService.isVersionGTE("0.0.0")).toBeTruthy();
        expect(testConfigService.isVersionGTE("0.1.0")).toBeFalsy();
        expect(testConfigService.isVersionGTE("1.0.0")).toBeFalsy();
    });

    it("should properly manage project addition and removal", (): void => {
        const testConfigService = new TestConfigService();

        testConfigService.addProject("test", "test", "/home/test");

        expect(testConfigService.config.projects).toEqual([
            {
                name: "test",
                path: "/home/test"
            }
        ]);

        testConfigService.removeProject("test");

        expect(testConfigService.config.projects).toEqual([]);

        testConfigService.save();
    });

    it("should properly manage preset registration and unregistration", (): void => {
        const testConfigService = new TestConfigService();

        testConfigService.registerPreset("test", PRESET_SOURCE_EXTERNAL, "/home/test");

        expect(testConfigService.config.presets).toEqual([
            {
                name: "test",
                source: PRESET_SOURCE_EXTERNAL,
                path: "/home/test"
            }
        ]);

        testConfigService.unregisterPreset("test");

        expect(testConfigService.config.presets).toEqual([]);

        testConfigService.save();
    });
});
