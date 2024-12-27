import {describe, it, expect} from "@jest/globals";
import {AppConfigService} from "./AppConfigService";
import {AppConfig, AppConfigProperties, PRESET_SOURCE_EXTERNAL} from "../makes";


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
                this._config = new class extends AppConfig {
                    constructor(props: AppConfigProperties) {
                        super(props);
                    }

                    public save() {}
                }({});
            }

            return this._config;
        }
    }

    it("should ...", () => {
        const testConfigService = new TestConfigService();

        expect(testConfigService.getConfig()).toBeInstanceOf(AppConfig);
    });

    it("should ...", () => {
        const testConfigService = new TestConfigService();

        expect(testConfigService.isVersionGTE("0.0.-1")).toBeTruthy();
        expect(testConfigService.isVersionGTE("0.0.0")).toBeTruthy();
        expect(testConfigService.isVersionGTE("0.1.0")).toBeFalsy();
        expect(testConfigService.isVersionGTE("1.0.0")).toBeFalsy();
    });

    it("should ...", () => {
        const testConfigService = new TestConfigService();

        testConfigService.addProject("test", "test", "/home/test");

        expect(testConfigService.config.projects).toEqual([
            {
                id: "test",
                name: "test",
                path: "/home/test"
            }
        ]);

        testConfigService.removeProject("test");

        expect(testConfigService.config.projects).toEqual([]);

        testConfigService.save();
    });

    it("should ...", () => {
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
