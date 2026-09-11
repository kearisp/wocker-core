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
    Factory
} from "../core";
import {Project} from "./Project";
import {FileSystemDriver, ProjectType, ProviderType} from "../types";
import {WOCKER_DATA_DIR} from "../env";


describe("Project", (): void => {
    const getContext = async (providers: ProviderType[] = []) => {
        // Exported (not just provided) so a @Global() module actually promotes
        // them to the container's global providers — see Scanner.scanExports().
        const exports = providers.map((provider) => {
            return typeof provider === "function" ? provider : provider.provide;
        });

        @Global()
        @Module({
            providers,
            exports
        })
        class TestModule {}

        const context = await Factory.create(TestModule, {
            fsDriver: vol as unknown as FileSystemDriver
        });

        return {
            container: context.get(Container)
        };
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

    it("should manage environment variables and container name", async (): Promise<void> => {
        const {container} = await getContext();

        AsyncStorage.enterWith(container);

        const project = new Project(
            "test-project",
            "/home/wocker/projects/test-project"
        );

        const ENV_KEY = "SOME_TEST_KEY",
              ENV_VALUE = "some-test-value",
              MISSING_KEY = "SECOND_TEST";

        expect(project.containerName).toBe(`${project.name}.workspace`);
        expect(project.hasEnv(ENV_KEY)).toBe(false);

        project.setEnv(ENV_KEY, ENV_VALUE);

        expect(project.getEnv(ENV_KEY)).toBe(ENV_VALUE);
        expect(project.hasEnv(ENV_KEY)).toBe(true);
        expect(project.hasEnv(MISSING_KEY)).toBe(false);

        project.unsetEnv(ENV_KEY);

        expect(project.hasEnv(ENV_KEY)).toBe(false);
    });

    it("should manage project domains", async (): Promise<void> => {
        const {container} = await getContext();

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

    it("should manage port mappings", async (): Promise<void> => {
        const {container} = await getContext();

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

    it("should manage volume mounts", async (): Promise<void> => {
        const {container} = await getContext();

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

    it("should manage project metadata", async (): Promise<void> => {
        const {container} = await getContext();

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

    it("should manage extra hosts", async (): Promise<void> => {
        const {container} = await getContext();

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

    it("should manage secrets", async (): Promise<void> => {
        class FakeKeystoreService {
            public store = new Map<string, string>();

            public async get(key: string, byDefault?: string): Promise<string | undefined> {
                return this.store.has(key) ? this.store.get(key) : byDefault;
            }

            public async set(key: string, value: string): Promise<void> {
                this.store.set(key, value);
            }

            public async delete(key: string): Promise<void> {
                this.store.delete(key);
            }

            public async list(): Promise<string[]> {
                return [...this.store.keys()];
            }
        }

        const fakeKeystoreService = new FakeKeystoreService();

        // A key belonging to some other, non-project-scoped consumer of the same
        // keystore (e.g. a plugin's own secret) — must never surface as a project secret.
        fakeKeystoreService.store.set("SOME_PLUGIN_SECRET", "unrelated");

        const {container} = await getContext([
            {
                // KeystoreService is @Injectable("KEYSTORE_SERVICE") — Project resolves
                // it from the container by that string token, not by class reference.
                provide: "KEYSTORE_SERVICE",
                useValue: fakeKeystoreService
            }
        ]);

        AsyncStorage.enterWith(container);

        vol.fromJSON({
            "wocker.config.json": JSON.stringify({
                projects: [
                    {
                        name: "test-project",
                        path: "/home/wocker/projects/test-project"
                    },
                    {
                        name: "test-project-2",
                        path: "/home/wocker/projects/test-project-2"
                    }
                ]
            }),
            "projects/test-project-2/config.json": JSON.stringify({
                type: ProjectType.DOCKERFILE
            })
        }, WOCKER_DATA_DIR);

        const project = new Project(
            "test-project",
            "/home/wocker/projects/test-project"
        );
        // Name deliberately extends "test-project" as a substring, so this also
        // proves getSecrets() prefix matching doesn't bleed across projects.
        const otherProject = new Project(
            "test-project-2",
            "/home/wocker/projects/test-project-2"
        );

        const SECRET_KEY = "db_password",
              SECRET_VALUE = "s3cr3t",
              MISSING_KEY = "missing";

        expect(await project.getSecret(SECRET_KEY)).toBeUndefined();
        expect(await project.getSecret(SECRET_KEY, "default")).toBe("default");
        expect(await project.getSecrets()).toEqual([]);

        await project.setSecret(SECRET_KEY, SECRET_VALUE);
        await otherProject.setSecret(SECRET_KEY, "other-project-value");

        expect(await project.getSecret(SECRET_KEY)).toBe(SECRET_VALUE);
        expect(await project.getSecrets()).toEqual([SECRET_KEY]);
        expect(await otherProject.getSecrets()).toEqual([SECRET_KEY]);
        expect(await otherProject.getSecret(SECRET_KEY)).toBe("other-project-value");

        await project.unsetSecret(SECRET_KEY);

        expect(await project.getSecret(SECRET_KEY)).toBeUndefined();
        expect(await project.getSecret(MISSING_KEY, "fallback")).toBe("fallback");
        expect(await project.getSecrets()).toEqual([]);
        expect(await otherProject.getSecrets()).toEqual([SECRET_KEY]);
    });
});
