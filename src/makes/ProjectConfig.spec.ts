import {describe, it, expect} from "@jest/globals";
import {ProjectConfig} from "./ProjectConfig";
import {ProjectType, ProjectConfigScope} from "../types";


describe("ProjectConfig", () => {
    describe("Basic properties", () => {
        it("should handle type", () => {
            const config = new ProjectConfig(ProjectConfigScope.APP, "{}");
            config.type = ProjectType.IMAGE;
            expect(config.type).toEqual(ProjectType.IMAGE);
            expect(JSON.parse(config.toString()).type).toEqual(ProjectType.IMAGE);

            config.type = undefined;
            expect(config.type).toBeUndefined();
            expect(JSON.parse(config.toString())).not.toHaveProperty("type");
        });

        it("should handle image and imageName", () => {
            const config = new ProjectConfig(ProjectConfigScope.APP, "{}");

            config.image = "node:23";
            expect(config.image).toEqual("node:23");
            expect(config.imageName).toEqual("node:23");

            config.imageName = "node:22";
            expect(config.image).toEqual("node:22");
            expect(config.imageName).toEqual("node:22");

            config.image = undefined;
            expect(config.image).toBeUndefined();
            expect(JSON.parse(config.toString())).not.toHaveProperty("image");
            expect(JSON.parse(config.toString())).not.toHaveProperty("imageName");
        });

        it("should handle dockerfile", () => {
            const config = new ProjectConfig(ProjectConfigScope.APP, "{}");
            config.dockerfile = "Dockerfile.dev";
            expect(config.dockerfile).toEqual("Dockerfile.dev");
            expect(JSON.parse(config.toString()).dockerfile).toEqual("Dockerfile.dev");
        });

        it("should handle composefile", () => {
            const config = new ProjectConfig(ProjectConfigScope.APP, "{}");
            config.type = ProjectType.COMPOSE;
            config.composefile = "docker-compose.yml";
            expect(config.composefile).toEqual("docker-compose.yml");
            expect(JSON.parse(config.toString()).composefile).toEqual("docker-compose.yml");
        });

        it("should handle preset and presetMode", () => {
            const config = new ProjectConfig(ProjectConfigScope.APP, "{}");
            config.preset = "laravel";
            config.presetMode = "global";

            expect(config.preset).toEqual("laravel");
            expect(config.presetMode).toEqual("global");
            expect(JSON.parse(config.toString()).preset).toEqual("laravel");
            expect(JSON.parse(config.toString()).presetMode).toEqual("global");
        });

        it("should handle cmd", () => {
            const config = new ProjectConfig(ProjectConfigScope.APP, "{}");
            config.cmd = ["npm", "start"];
            expect([...config.cmd]).toEqual(["npm", "start"]);
            expect(JSON.parse(config.toString()).cmd).toEqual(["npm", "start"]);
        });

        it("should handle metadata", () => {
            const config = new ProjectConfig(ProjectConfigScope.APP, "{}");

            expect(config.metadata).toEqual({});
            config.metadata.version = "1.0.0";

            expect(config.metadata).toEqual({
                version: "1.0.0"
            });
            expect(config.metadata.version).toEqual("1.0.0");
            expect(JSON.parse(config.toString()).metadata.version).toEqual("1.0.0");
        });

        it("should handle scripts", () => {
            const config = new ProjectConfig(ProjectConfigScope.APP, "{}");
            config.scripts = {test: "jest"};
            expect(config.scripts.test).toEqual("jest");
            expect(JSON.parse(config.toString()).scripts.test).toEqual("jest");
        });
    });

    describe("Environment variables", () => {
        it("should handle env proxy", () => {
            const config = new ProjectConfig(ProjectConfigScope.APP, "{}");
            config.env.TEST = "foo";
            expect(config.env.TEST).toEqual("foo");
            expect(JSON.parse(config.toString()).env.TEST).toEqual("foo");
        });

        it("should handle setEnv and getEnv", () => {
            const config = new ProjectConfig(ProjectConfigScope.APP, "{}");
            config.setEnv("VAR", "value");
            expect(config.getEnv("VAR")).toEqual("value");
            expect(config.getEnv("MISSING", "default")).toEqual("default");
            expect(config.hasEnv("VAR")).toBeTruthy();
            expect(config.hasEnv("MISSING")).toBeFalsy();
        });

        it("should handle boolean values in setEnv", () => {
            const config = new ProjectConfig(ProjectConfigScope.APP, "{}");
            config.setEnv("BOOL_TRUE", true);
            config.setEnv("BOOL_FALSE", false);
            expect(config.getEnv("BOOL_TRUE")).toEqual("true");
            expect(config.getEnv("BOOL_FALSE")).toEqual("false");
        });

        it("should handle unsetEnv", () => {
            const config = new ProjectConfig(ProjectConfigScope.APP, "{\"env\": {\"VAR\": \"val\"}}");
            expect(config.hasEnv("VAR")).toBeTruthy();
            config.unsetEnv("VAR");
            expect(config.hasEnv("VAR")).toBeFalsy();
        });

        it("should handle service env", () => {
            const config = new ProjectConfig(ProjectConfigScope.APP, "{}");
            config.setEnv("VAR", "val", "service1");
            expect(JSON.parse(config.toString()).services.service1.env.VAR).toEqual("val");

            config.unsetEnv("VAR", "service1");
            expect(JSON.parse(config.toString()).services.service1.env).toEqual({});
        });
    });

    describe("Build arguments", () => {
        it("should handle buildArgs proxy", () => {
            const config = new ProjectConfig(ProjectConfigScope.APP, "{}");
            config.buildArgs.ARG = "val";
            expect(config.buildArgs.ARG).toEqual("val");
        });

        it("should handle setBuildArg and unsetBuildArg", () => {
            const config = new ProjectConfig(ProjectConfigScope.APP, "{}");
            config.setBuildArg("ARG", "val");
            expect(config.buildArgs.ARG).toEqual("val");

            config.unsetBuildArg("ARG");
            expect(config.buildArgs.ARG).toBeUndefined();
        });

        it("should handle service buildArgs", () => {
            const config = new ProjectConfig(ProjectConfigScope.APP, "{}");
            config.setBuildArg("ARG", "val", "service1");
            expect(JSON.parse(config.toString()).services.service1.buildArgs.ARG).toEqual("val");

            config.unsetBuildArg("ARG", "service1");
            expect(JSON.parse(config.toString()).services.service1.buildArgs).toEqual({});
        });
    });

    describe("Volumes", () => {
        it("should handle volumes proxy", () => {
            const config = new ProjectConfig(ProjectConfigScope.APP, "{}");
            config.volumes.push("./src:/app/src");
            expect(config.volumes).toContain("./src:/app/src");
        });

        it("should mount volumes", () => {
            const config = new ProjectConfig(ProjectConfigScope.APP, "{}");
            config.volumeMount("./src:/app/src", "./data:/app/data");
            expect(config.volumes).toHaveLength(2);
            expect(config.volumes).toContain("./src:/app/src");
            expect(config.volumes).toContain("./data:/app/data");

            // Overwrite by destination
            config.volumeMount("./new-src:/app/src");
            expect(config.volumes).toHaveLength(2);
            expect(config.volumes).toContain("./new-src:/app/src");
            expect(config.volumes).not.toContain("./src:/app/src");
        });

        it("should unmount volumes", () => {
            const config = new ProjectConfig(ProjectConfigScope.APP, "{\"volumes\": [\"./src:/app/src\", \"./data:/app/data\"]}");
            config.volumeUnmount("./src:/app/src");
            expect(config.volumes).toHaveLength(1);
            expect(config.volumes).toContain("./data:/app/data");
        });

        it("should get volume by source or destination", () => {
            const config = new ProjectConfig(ProjectConfigScope.APP, "{\"volumes\": [\"./src:/app/src\"]}");
            expect(config.getVolumeBySource("./src")).toEqual("./src:/app/src");
            expect(config.getVolumeByDestination("/app/src")).toEqual("./src:/app/src");
        });
    });

    describe("Ports and Extra Hosts", () => {
        it("should handle ports", () => {
            const config = new ProjectConfig(ProjectConfigScope.APP, "{}");
            config.ports = ["8080:80"];
            expect([...config.ports]).toEqual(["8080:80"]);
        });

        it("should handle extra hosts", () => {
            const config = new ProjectConfig(ProjectConfigScope.APP, "{}");
            config.addExtraHost("host.docker.internal", "127.0.0.1");
            expect(config.extraHosts["host.docker.internal"]).toEqual("127.0.0.1");

            config.removeExtraHost("host.docker.internal");
            expect(config.extraHosts).not.toHaveProperty("host.docker.internal");
        });
    });
});
