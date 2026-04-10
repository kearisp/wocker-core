import {describe, it, expect, beforeEach} from "@jest/globals";
import {vol} from "memfs";
import {Module} from "../decorators";
import {AppConfig, AppConfigProperties} from "../makes";
import {Factory, Container} from "../core";
import {AppConfigService} from "./AppConfigService";
import {AppService} from "./AppService";
import {AppFileSystemService} from "./AppFileSystemService";
import {LogService} from "./LogService";
import {ProcessService} from "./ProcessService";
import {PRESET_SOURCE_EXTERNAL} from "../types";
import {WOCKER_DATA_DIR, WOCKER_DATA_DIR_KEY, WOCKER_VERSION_KEY, FILE_SYSTEM_DRIVER_KEY} from "../env";


describe("AppConfigService", (): void => {
    beforeEach((): void => {
        vol.reset();
    });

    const getContext = async (version = "1.0.0") => {
        // const context = await Test
        //     .createTestingModule({
        //         imports: [CoreModule]
        //     })
        //     .overrideProvider(WOCKER_VERSION_KEY).useValue(version)
        //     .overrideProvider(WOCKER_DATA_DIR_KEY).useValue(WOCKER_DATA_DIR)
        //     .overrideProvider(FILE_SYSTEM_DRIVER_KEY).useValue(vol)
        //     .build();

        @Module({
            providers: [
                {
                    provide: WOCKER_VERSION_KEY,
                    useValue: version
                },
                {
                    provide: WOCKER_DATA_DIR_KEY,
                    useValue: WOCKER_DATA_DIR
                },
                {
                    provide: FILE_SYSTEM_DRIVER_KEY,
                    useValue: vol
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

        const container = context.get(Container);

        container.replace(WOCKER_VERSION_KEY, {
            provide: WOCKER_VERSION_KEY,
            useValue: version
        });
        container.replace(FILE_SYSTEM_DRIVER_KEY, {
            provide: FILE_SYSTEM_DRIVER_KEY,
            useValue: vol
        });

        return {
            appService: context.get(AppService),
            appConfigService: context.get(AppConfigService),
            fs: context.get(AppFileSystemService)
        };
    };

    it("should return instance of AppConfig when getting config", async (): Promise<void> => {
        const {appConfigService} = await getContext();

        expect(appConfigService.getConfig()).toBeInstanceOf(AppConfig);
    });

    it("should correctly compare versions using isVersionGTE", async (): Promise<void> => {
        const {appConfigService} = await getContext("1.0.24");

        expect(appConfigService.isVersionGTE("0.0.0")).toBeTruthy();
        expect(appConfigService.isVersionGTE("1.0.23")).toBeTruthy();
        expect(appConfigService.isVersionGTE("1.0.24")).toBeTruthy();
        expect(appConfigService.isVersionGTE("1.0.25")).toBeFalsy();
    });

    it("should successfully parse projects configuration from wocker.config.js file", async (): Promise<void> => {
        const config: AppConfigProperties = {
            logLevel: "info",
            projects: [
                {
                    name: "project1",
                    path: "/home/wocker-test/projects/project1"
                }
            ]
        };
        const configString = JSON.stringify(config);

        vol.fromJSON({
            "wocker.config.js": `exports.config = ${configString};`
        }, WOCKER_DATA_DIR);

        const {appConfigService} = await getContext();

        expect(appConfigService.config.logLevel).toBe("info");
        expect(appConfigService.config.projects).toEqual([
            {
                name: "project1",
                path: "/home/wocker-test/projects/project1"
            }
        ]);
    });

    it("should fallback to wocker.config.json when wocker.config.js throws an error", async (): Promise<void> => {
        const config = {
            projects: [
                {
                    name: "test-exception-project",
                    path: "/home/wocker-test/projects/project1"
                }
            ]
        };
        const configString = JSON.stringify(config);

        vol.fromJSON({
            "wocker.config.js": "throw new Error('Error')",
            "wocker.config.json": JSON.stringify(configString)
        }, WOCKER_DATA_DIR);

        const {appConfigService} = await getContext();

        expect(appConfigService.projects).toEqual([
            {
                name: "test-exception-project",
                path: "/home/wocker-test/projects/project1"
            }
        ]);
    });

    it("should successfully parse config from wocker.config.json file", async (): Promise<void> => {
        vol.fromJSON({
            "wocker.config.json": JSON.stringify({
                logLevel: "info",
                projects: [
                    {
                        name: "test",
                        path: "/home/wocker-test/projects/project1"
                    }
                ]
            })
        }, WOCKER_DATA_DIR);

        const {appConfigService} = await getContext();

        expect(appConfigService.config.logLevel).toBe("info");
        expect(appConfigService.config.projects).toEqual([
            {
                name: "test",
                path: "/home/wocker-test/projects/project1"
            }
        ]);
    });

    it("should successfully parse config from wocker.json file", async (): Promise<void> => {
        vol.fromJSON({
            "wocker.json": JSON.stringify(
                JSON.stringify({
                    logLevel: "info",
                    projects: [
                        {
                            name: "test",
                            path: "/home/wocker-test/projects/project1"
                        }
                    ]
                })
            )
        }, WOCKER_DATA_DIR);

        const {appConfigService} = await getContext();

        expect(appConfigService.config.logLevel).toBe("info");
        expect(appConfigService.config.projects).toEqual([
            {
                name: "test",
                path: "/home/wocker-test/projects/project1"
            }
        ]);
    });

    it("should successfully parse config from data.json file", async (): Promise<void> => {
        vol.fromJSON({
            "data.json": JSON.stringify({
                logLevel: "info",
                projects: [
                    {
                        id: "test",
                        src: "/home/wocker-test/projects/project1"
                    }
                ]
            })
        }, WOCKER_DATA_DIR);

        const {appConfigService} = await getContext();

        expect(appConfigService.config.logLevel).toBe("info");
        expect(appConfigService.config.projects).toEqual([
            {
                name: "test",
                path: "/home/wocker-test/projects/project1"
            }
        ]);
    });

    it("should set and return correct working directory", async (): Promise<void> => {
        const projectDir = "/home/wocker-test/projects/test-project";

        vol.mkdirSync(projectDir, {
            recursive: true
        });

        const {appConfigService} = await getContext();

        let pwd = projectDir;

        jest.spyOn(process, "chdir").mockImplementation((path) => {
            if(!vol.existsSync(path)) {
                throw new Error(`ENOENT: no such file or directory, chdir '${pwd}' -> '${path}'`);
            }

            pwd = path
        });

        jest.spyOn(process, "cwd").mockImplementation(() => {
            return pwd;
        });

        appConfigService.setPWD(projectDir);

        expect(appConfigService.pwd()).toBe(projectDir);
    });

    it("should create wocker.config.js and save project configuration when adding new project", async (): Promise<void> => {
        const {appConfigService, fs} = await getContext();

        expect(fs.exists("wocker.config.js")).toBeFalsy();

        appConfigService.addProject("project1", "/home/wocker-test/projects/project1");
        appConfigService.save();

        expect(fs.exists("wocker.config.js")).toBeTruthy();

        const jsConfig = fs.readFile("wocker.config.js").toString();

        expect(jsConfig).toContain(`"name": "project1"`);
        expect(jsConfig).toContain(`"path": "/home/wocker-test/projects/project1"`);
    });

    it("should cleanup legacy config files (wocker.json and data.json) when saving new configuration", async (): Promise<void> => {
        const config = {
            projects: [
                {
                    name: "project1",
                    path: "/home/wocker-test/projects/project1"
                }
            ]
        };
        const configString = JSON.stringify(config);

        vol.fromJSON({
            "wocker.config.js": `exports.config = ${configString};`,
            "wocker.json": JSON.stringify(configString),
            "data.json": configString
        }, WOCKER_DATA_DIR);

        const {appConfigService, fs} = await getContext();

        appConfigService.addProject("project2", "/home/wocker-test/projects/project2");
        appConfigService.save();

        expect(fs.exists("wocker.config.js")).toBeTruthy();
        expect(fs.exists("wocker.config.json")).toBeTruthy();
        expect(fs.exists("wocker.json")).toBeFalsy();
        expect(fs.exists("data.json")).toBeFalsy();
    });

    it("should recreate config directory on saving", async (): Promise<void> => {
        const config = {
            projects: [
                {
                    name: "project1",
                    path: "/home/wocker-test/projects/project1"
                }
            ]
        };
        const configString = JSON.stringify(config);

        vol.fromJSON({
            "wocker.config.js": `exports.config = ${configString};`
        }, WOCKER_DATA_DIR);

        const {appConfigService, fs} = await getContext();

        expect(appConfigService.projects).toEqual([
            {
                name: "project1",
                path: "/home/wocker-test/projects/project1"
            }
        ]);

        vol.reset();

        expect(fs.exists("wocker.config.js")).toBeFalsy();
        expect(fs.exists("wocker.config.json")).toBeFalsy();

        appConfigService.save();

        expect(fs.exists("wocker.config.js")).toBeTruthy();
        expect(fs.exists("wocker.config.json")).toBeTruthy();

        const jsConfig = fs.readFile("wocker.config.js").toString();

        expect(jsConfig).toContain(`"name": "project1"`);
        expect(jsConfig).toContain(`"path": "/home/wocker-test/projects/project1"`);
    });

    it("should properly manage project addition and removal", async (): Promise<void> => {
        const {appConfigService} = await getContext();

        appConfigService.addProject("test", "/home/test");

        expect(appConfigService.config.projects).toEqual([
            {
                name: "test",
                path: "/home/test"
            }
        ]);

        appConfigService.removeProject("test");

        expect(appConfigService.config.projects).toEqual([]);

        appConfigService.save();
    });

    it("should properly manage preset registration and unregistration", async (): Promise<void> => {
        const {appConfigService} = await getContext();

        appConfigService.registerPreset("test", PRESET_SOURCE_EXTERNAL, "/home/test");

        expect(appConfigService.config.presets).toEqual([
            {
                name: "test",
                source: PRESET_SOURCE_EXTERNAL,
                path: "/home/test"
            }
        ]);

        appConfigService.unregisterPreset("test");

        expect(appConfigService.config.presets).toEqual([]);

        appConfigService.save();
    });
});
