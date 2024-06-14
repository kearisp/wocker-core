import {describe, it, expect, beforeEach} from "@jest/globals";
import {Logger} from "@kearisp/cli";

import {Project, ProjectProperties} from "./Project";


describe("Project", () => {
    beforeEach(() => {
        Logger.debug("-----------");
        Logger.mute();
    });

    class TestProject extends Project {
        public constructor(data: ProjectProperties) {
            super(data);
        }

        public async save() {
            //
        }
    }

    it("", () => {
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

    it("Meta", () => {
        const project = new TestProject({
            id: "123",
            name: "project",
            type: "dockerfile",
            path: "/path/to/project",
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
});
