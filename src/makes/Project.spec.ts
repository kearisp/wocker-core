import {describe, it, expect, beforeEach} from "@jest/globals";
import {Logger} from "@kearisp/cli";

import {Project, ProjectProperties} from "./Project";
import {volumeFormat} from "../utils/volumeFormat";


describe("Project", (): void => {
    beforeEach((): void => {
        Logger.debug("-----------");
        Logger.mute();
    });

    class TestProject extends Project {
        public constructor(data: ProjectProperties) {
            super(data);
        }

        public async getSecret(key: string, byDefault: string) {
            return byDefault;
        }

        public async setSecret() {}

        public async save() {
            //
        }
    }

    it("Env", (): void => {
        const project = new TestProject({
            id: "123",
            name: "project",
            type: "dockerfile",
            path: "/path/to/project",
        });

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

    it("Domains", (): void => {
        const project = new TestProject({
            id: "1",
            type: "image",
            imageName: "test",
            name: "Test",
            path: "/test/path"
        });

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

    it("Ports", (): void => {
        const project = new TestProject({
            id: "1",
            name: "test",
            type: "dockerfile",
            path: "/path/to/test/project"
        });

        const hostPort = 8080;
        const containerPort = 80;

        project.linkPort(hostPort, containerPort);

        expect(project.ports).toEqual([`${hostPort}:${containerPort}`]);

        project.unlinkPort(hostPort, containerPort);

        expect(project.ports).toBeUndefined();
    });

    it("Volumes", (): void => {
        const project = new TestProject({
            id: "1",
            name: "test",
            type: "dockerfile",
            path: "/path/to/test/project"
        });

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

        expect(project.volumes).toEqual(undefined);
    });

    it("Meta", (): void => {
        const project = new TestProject({
            id: "123",
            name: "project",
            type: "dockerfile",
            path: "/path/to/project"
        });

        const VALUE_KEY = "value";
        const MISSING_KEY = "missing";

        project.metadata = {};

        expect(project.hasMeta(MISSING_KEY)).toBe(false);

        delete project.metadata;

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

    it("Extra host", (): void => {
        const project = new TestProject({
            id: "123",
            name: "project",
            type: "dockerfile",
            path: "/path/to/project"
        });
        const EXTRA_HOST_1 = "127.0.0.1";
        const EXTRA_HOST_2 = "127.0.0.2";
        const EXTRA_DOMAIN_1 = 'test.host';
        const EXTRA_DOMAIN_2 = 'test-2.host';

        expect(project.extraHosts).toBeUndefined();

        project.addExtraHost(EXTRA_HOST_1, EXTRA_DOMAIN_1);

        expect(project.extraHosts).toEqual({
            [EXTRA_HOST_1]: EXTRA_DOMAIN_1
        });

        project.removeExtraHost(EXTRA_HOST_1);

        expect(project.extraHosts).toBeUndefined();

        project.addExtraHost(EXTRA_HOST_1, EXTRA_DOMAIN_1);
        project.addExtraHost(EXTRA_HOST_2, EXTRA_DOMAIN_2);

        expect(project.extraHosts).toEqual({
            [EXTRA_HOST_1]: EXTRA_DOMAIN_1,
            [EXTRA_HOST_2]: EXTRA_DOMAIN_2
        });
    });
});
