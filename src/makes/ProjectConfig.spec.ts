import {describe, it, expect} from "@jest/globals";
import {ProjectConfig} from "./ProjectConfig";
import {ProjectType, PresetMode} from "../types";


describe("ProjectConfig", () => {
    describe("Basic properties", () => {
        it("should handle type", () => {
            const config = new ProjectConfig("{}");
            config.type = ProjectType.IMAGE;
            expect(config.type).toEqual(ProjectType.IMAGE);
            expect(JSON.parse(config.toString()).type).toEqual(ProjectType.IMAGE);

            config.type = undefined;
            expect(config.type).toBeUndefined();
            expect(JSON.parse(config.toString())).not.toHaveProperty("type");
        });

        it("should handle image and imageName", () => {
            const config = new ProjectConfig("{}");

            config.image = "node:23";
            expect(config.image).toEqual("node:23");

            config.image = undefined;
            expect(config.image).toBeUndefined();
            expect(JSON.parse(config.toString())).not.toHaveProperty("image");
        });

        it("should handle dockerfile", () => {
            const config = new ProjectConfig("{}");
            config.dockerfile = "Dockerfile.dev";
            expect(config.dockerfile).toEqual("Dockerfile.dev");
            expect(JSON.parse(config.toString()).dockerfile).toEqual("Dockerfile.dev");
        });

        it("should handle composefile", () => {
            const config = new ProjectConfig("{}");
            config.type = ProjectType.COMPOSE;
            config.composefile = "docker-compose.yml";
            expect(config.composefile).toEqual("docker-compose.yml");
            expect(JSON.parse(config.toString()).composefile).toEqual("docker-compose.yml");
        });

        it("should handle preset and presetMode", () => {
            const config = new ProjectConfig("{}");
            config.preset = "laravel";
            config.presetMode = PresetMode.GLOBAL;

            expect(config.preset).toEqual("laravel");
            expect(config.presetMode).toEqual("global");
            expect(JSON.parse(config.toString()).preset).toEqual("laravel");
            expect(JSON.parse(config.toString()).presetMode).toEqual("global");
        });

        it("should handle cmd", () => {
            const config = new ProjectConfig("{}");
            config.cmd = ["npm", "start"];
            expect([...config.cmd]).toEqual(["npm", "start"]);
            expect(JSON.parse(config.toString()).cmd).toEqual(["npm", "start"]);
        });

        it("should handle metadata", () => {
            const config = new ProjectConfig("{}");

            expect(config.metadata).toEqual({});
            config.metadata.version = "1.0.0";

            expect(config.metadata).toEqual({
                version: "1.0.0"
            });
            expect(config.metadata.version).toEqual("1.0.0");
            expect(JSON.parse(config.toString()).metadata.version).toEqual("1.0.0");
        });

        it("should handle scripts", () => {
            const config = new ProjectConfig("{}");
            config.scripts = {test: "jest"};
            expect(config.scripts.test).toEqual("jest");
            expect(JSON.parse(config.toString()).scripts.test).toEqual("jest");
        });
    });

    describe("Environment variables", () => {
        it("should handle env proxy", () => {
            const config = new ProjectConfig("{}");
            config.env.TEST = "foo";
            expect(config.env.TEST).toEqual("foo");
            expect(JSON.parse(config.toString()).env.TEST).toEqual("foo");
        });

        it("should handle setEnv and getEnv", () => {
            const config = new ProjectConfig("{}");

            config.setEnv("VAR", "value");

            expect(config.getEnv("VAR")).toEqual("value");
            expect(config.getEnv("MISSING", "default")).toEqual("default");
            expect(config.hasEnv("VAR")).toBeTruthy();
            expect(config.hasEnv("MISSING")).toBeFalsy();
        });

        it("should handle boolean values in setEnv", () => {
            const config = new ProjectConfig("{}");
            config.setEnv("BOOL_TRUE", true);
            config.setEnv("BOOL_FALSE", false);
            expect(config.getEnv("BOOL_TRUE")).toEqual("true");
            expect(config.getEnv("BOOL_FALSE")).toEqual("false");
        });

        it("should handle unsetEnv", () => {
            const config = new ProjectConfig("{\"env\": {\"VAR\": \"val\"}}");

            expect(config.hasEnv("VAR")).toBeTruthy();

            config.unsetEnv("VAR");

            expect(config.hasEnv("VAR")).toBeFalsy();
        });

        it("should handle service env", () => {
            const config = new ProjectConfig("{}");
            config.setEnv("VAR", "val", "service1");
            expect(JSON.parse(config.toString()).services.service1.env.VAR).toEqual("val");

            config.unsetEnv("VAR", "service1");
            expect(JSON.parse(config.toString()).services.service1.env).toEqual({});
        });
    });

    describe("Build arguments", () => {
        it("should handle buildArgs proxy", () => {
            const config = new ProjectConfig("{}");
            config.buildArgs.ARG = "val";
            expect(config.buildArgs.ARG).toEqual("val");
        });

        it("should handle setBuildArg and unsetBuildArg", () => {
            const config = new ProjectConfig("{}");
            config.setBuildArg("ARG", "val");
            expect(config.buildArgs.ARG).toEqual("val");

            config.unsetBuildArg("ARG");
            expect(config.buildArgs.ARG).toBeUndefined();
        });

        it("should handle service buildArgs", () => {
            const config = new ProjectConfig("{}");
            config.setBuildArg("ARG", "val", "service1");
            expect(JSON.parse(config.toString()).services.service1.buildArgs.ARG).toEqual("val");

            config.unsetBuildArg("ARG", "service1");
            expect(JSON.parse(config.toString()).services.service1.buildArgs).toEqual({});
        });
    });

    describe("Volumes", () => {
        it("should handle volumes proxy", () => {
            const config = new ProjectConfig("{}");
            config.volumes.push("./src:/app/src");
            expect(config.volumes).toContain("./src:/app/src");
        });

        it("should mount volumes", () => {
            const config = new ProjectConfig("{}");
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
            const config = new ProjectConfig("{\"volumes\": [\"./src:/app/src\", \"./data:/app/data\"]}");
            config.volumeUnmount("./src:/app/src");
            expect(config.volumes).toHaveLength(1);
            expect(config.volumes).toContain("./data:/app/data");
        });

        it("should get volume by source or destination", () => {
            const config = new ProjectConfig("{\"volumes\": [\"./src:/app/src\"]}");
            expect(config.getVolumeBySource("./src")).toEqual("./src:/app/src");
            expect(config.getVolumeByDestination("/app/src")).toEqual("./src:/app/src");
        });
    });

    describe("Ports and Extra Hosts", () => {
        it("should handle ports", () => {
            const config = new ProjectConfig("{}");
            config.ports = ["8080:80"];
            expect([...config.ports]).toEqual(["8080:80"]);
        });

        it("should handle extra hosts", () => {
            const config = new ProjectConfig("{}");
            config.addExtraHost("host.docker.internal", "127.0.0.1");
            expect(config.extraHosts["host.docker.internal"]).toEqual("127.0.0.1");

            config.removeExtraHost("host.docker.internal");
            expect(config.extraHosts).not.toHaveProperty("host.docker.internal");
        });
    });

    describe("isDirty on read", () => {
        it("should not make a compact config dirty when reading an array through state", () => {
            const origin = '{"ports":["1:1"],"env":{"A":"1"}}';
            const config = new ProjectConfig(origin);

            config.ports!.map((port) => port);

            expect(config.toString()).toBe(origin);
            expect(config.isDirty()).toBe(false);
        });

        it("should not make a config dirty when spreading the ports getter", () => {
            const origin = '{\n  "ports": ["1:1"]\n}';
            const config = new ProjectConfig(origin);

            const copy = [...config.ports];

            expect(copy).toEqual(["1:1"]);
            expect(config.toString()).toBe(origin);
            expect(config.isDirty()).toBe(false);
        });
    });

    describe("imageName migration", () => {
        it("should move the legacy imageName to image on read", () => {
            const config = new ProjectConfig('{"type":"image","imageName":"php:8.3-apache"}');

            expect(config.image).toBe("php:8.3-apache");
            expect(JSON.parse(config.toString())).not.toHaveProperty("imageName");
            expect(JSON.parse(config.toString()).image).toBe("php:8.3-apache");
            expect(config.isDirty()).toBe(true);
        });

        it("should prefer image over the legacy imageName", () => {
            const config = new ProjectConfig('{"image":"node:23","imageName":"node:18"}');

            expect(config.image).toBe("node:23");
            expect(JSON.parse(config.toString())).not.toHaveProperty("imageName");
        });

        it("should leave a config without imageName untouched", () => {
            const origin = '{"image":"node:23"}';
            const config = new ProjectConfig(origin);

            expect(config.toString()).toBe(origin);
            expect(config.isDirty()).toBe(false);
        });
    });

    describe("mutating array methods", () => {
        it("should write the array back after push", () => {
            const config = new ProjectConfig('{"ports":["1:1"]}');

            config.ports.push("2:2");

            expect(JSON.parse(config.toString()).ports).toEqual(["1:1", "2:2"]);
            expect(config.isDirty()).toBe(true);
        });
    });

    describe("services", () => {
        it("should return an empty object without creating the key when no services are set", () => {
            const config = new ProjectConfig("{}");

            expect(config.state.services).toBeUndefined();
            expect(config.services).toEqual({});
            expect(config.toString()).toBe("{}");
            expect(config.isDirty()).toBe(false);
        });

        it("should read services from the existing config", () => {
            const config = new ProjectConfig('{"services":{"web":{"containerName":"web.ws","env":{"A":"1"}}}}');

            expect(config.services.web.containerName).toBe("web.ws");
            expect(config.services.web.env).toEqual({A: "1"});
            expect(Object.keys(config.services)).toEqual(["web"]);
        });

        it("should not make the config dirty when only reading services", () => {
            const origin = '{"services":{"web":{"env":{"A":"1"}}}}';
            const config = new ProjectConfig(origin);

            JSON.stringify(config.services);
            Object.keys(config.services);

            expect(config.toString()).toBe(origin);
            expect(config.isDirty()).toBe(false);
        });

        it("should write a new service through the proxy", () => {
            const config = new ProjectConfig("{}");

            config.services.web = {containerName: "web.ws"};

            expect(JSON.parse(config.toString()).services).toEqual({
                web: {containerName: "web.ws"}
            });
            expect(config.isDirty()).toBe(true);
        });

        it("should remove the services key when the last service is deleted", () => {
            const config = new ProjectConfig('{"services":{"web":{"containerName":"web.ws"}}}');

            delete config.services.web;

            expect(JSON.parse(config.toString())).not.toHaveProperty("services");
        });

        it("should keep services in sync with setEnv and setBuildArg", () => {
            const config = new ProjectConfig("{}");

            config.setEnv("A", "1", "web");
            config.setBuildArg("B", "2", "web");

            expect(config.services.web.env).toEqual({A: "1"});
            expect(config.services.web.buildArgs).toEqual({B: "2"});
        });
    });
});
