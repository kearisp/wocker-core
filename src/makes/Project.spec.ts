import {describe, it, expect, beforeEach} from "@jest/globals";
import {vol} from "memfs";
import {volumeFormat} from "../utils/volumeFormat";
import {
    Module,
    Global
} from "../decorators";
import {
    AsyncStorage,
    Container,
    Scanner
} from "../core";
import {Project} from "./Project";
import {ProjectRepository} from "../services/ProjectRepository";
import {ProjectType} from "../types";
import {WOCKER_DATA_DIR, FILE_SYSTEM_DRIVER_KEY} from "../env";


describe("Project", (): void => {
    const getContext = async () => {
        @Global()
        @Module({
            providers: [ProjectRepository],
            exports: [ProjectRepository]
        })
        class TestModule {}

        const container = new Container(),
              scanner = new Scanner(container);

        await scanner.scan(TestModule);

        container.replace(FILE_SYSTEM_DRIVER_KEY, {
            provide: FILE_SYSTEM_DRIVER_KEY,
            useValue: vol
        });

        return container;
    }

    beforeEach(() => {
        vol.fromJSON({
            "wocker.config.json": JSON.stringify({
                projects: [
                    {
                        name: "test-project",
                        path: "/home/wocker/projects/test-project"
                    }
                ]
            }),
            "projects/test-project/config.json": JSON.stringify({
                type: ProjectType.DOCKERFILE
            })
        }, WOCKER_DATA_DIR);
    });

    it("should process env vars", async (): Promise<void> => {
        const container = await getContext();

        AsyncStorage.enterWith(container);

        const project = new Project(
            "test-project",
            "/home/wocker/projects/test-project"
        );

        const VALUE_KEY = "value";
        const MISSING_KEY = "missing";

        expect(project.containerName).toBe(`${project.name}.workspace`);
        expect(project.hasEnv(MISSING_KEY)).toBe(false);

        project.setEnv(VALUE_KEY, "test-value");

        expect(project.getEnv(VALUE_KEY)).toBe("test-value");
        expect(project.hasEnv(MISSING_KEY)).toBe(false);

        project.unsetEnv(VALUE_KEY);
        project.unsetEnv(VALUE_KEY);
    });

    it("Domains", async (): Promise<void> => {
        const container = await getContext();

        AsyncStorage.enterWith(container);

        const project = new Project(
            "test-project",
            "/home/wocker/projects/test-project"
        );

        const domain1 = "test.com";
        const domain2 = "test.net";

        expect(project.domains).toEqual([]);

        project.addDomain(domain1);

        expect(project.domains).toEqual([domain1]);

        project.addDomain(domain2);

        expect(project.domains).toEqual([domain1, domain2]);

        project.removeDomain(domain1);

        expect(project.domains).toEqual([domain2]);

        project.clearDomains();

        expect(project.domains).toEqual([]);
    });

    it("Ports", async (): Promise<void> => {
        const container = await getContext();

        AsyncStorage.enterWith(container);

        const project = new Project(
            "test-project",
            "/home/wocker/projects/test-project"
        );

        const hostPort = 8080;
        const containerPort = 80;

        project.linkPort(hostPort, containerPort);

        expect(project.ports).toEqual([`${hostPort}:${containerPort}`]);

        project.unlinkPort(hostPort, containerPort);

        expect(project.ports).toEqual([]);
    });

    it("Volumes", async (): Promise<void> => {
        const container = await getContext();

        AsyncStorage.enterWith(container);

        const project = new Project(
            "test-project",
            "/home/wocker/projects/test-project"
        );

        const volume = volumeFormat({
            source: "./",
            destination: "/var/www",
            options: "rw"
        });

        project.volumeMount(volumeFormat({
            source: "./",
            destination: "/var/www",
            options: "rw"
        }));

        expect(project.volumes).toEqual([volume]);

        expect(project.getVolumeBySource("./")).toBe(volume);

        project.volumeUnmount(volumeFormat({
            source: "./",
            destination: "/var/www"
        }));

        expect(project.volumes).toEqual([]);
    });

    it("Meta", async (): Promise<void> => {
        const container = await getContext();

        AsyncStorage.enterWith(container);

        const project = new Project(
            "test-project",
            "/home/wocker/projects/test-project"
        );

        const VALUE_KEY = "value";
        const MISSING_KEY = "missing";

        expect(project.hasMeta(MISSING_KEY)).toBe(false);

        expect(project.getMeta(MISSING_KEY, "defaultValue")).toBe("defaultValue");

        project.setMeta(VALUE_KEY, "testValue");

        expect(project.getMeta(VALUE_KEY)).toBe("testValue");

        project.unsetMeta(VALUE_KEY);
        project.unsetMeta(VALUE_KEY);

        expect(project.getMeta(VALUE_KEY, "default")).toBe("default");

        project.setMeta(VALUE_KEY, true);

        expect(project.getMeta(VALUE_KEY)).toBe("true");

        project.setMeta(VALUE_KEY, false);

        expect(project.getMeta(VALUE_KEY)).toBe("false");
    });

    it("Extra host", async (): Promise<void> => {
        const container = await getContext();

        AsyncStorage.enterWith(container);

        const project = new Project(
            "test-project",
            "/home/wocker/projects/test-project"
        );

        const EXTRA_HOST_1 = "127.0.0.1";
        const EXTRA_HOST_2 = "127.0.0.2";
        const EXTRA_DOMAIN_1 = "test.host";
        const EXTRA_DOMAIN_2 = "test-2.host";

        project.addExtraHost(EXTRA_HOST_1, EXTRA_DOMAIN_1);

        expect(project.extraHosts).toEqual({
            [EXTRA_HOST_1]: EXTRA_DOMAIN_1
        });

        project.removeExtraHost(EXTRA_HOST_1);

        expect(project.extraHosts).toEqual({});

        project.addExtraHost(EXTRA_HOST_1, EXTRA_DOMAIN_1);
        project.addExtraHost(EXTRA_HOST_2, EXTRA_DOMAIN_2);

        expect(project.extraHosts).toEqual({
            [EXTRA_HOST_1]: EXTRA_DOMAIN_1,
            [EXTRA_HOST_2]: EXTRA_DOMAIN_2
        });
    });
});
