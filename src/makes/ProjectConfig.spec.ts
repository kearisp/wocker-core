import {beforeEach, describe, it} from "@jest/globals";
import {vol} from "memfs";
import {Module} from "../decorators";
import {AsyncStorage, Container, Factory} from "../core";
import {ProjectRepository} from "../services";
import {WOCKER_DATA_DIR} from "../env";
import {ProjectType} from "../types";


describe("ProjectConfig", (): void => {
    const PROJECT_1_NAME = "foo",
          PROJECT_1_PATH = "/home/wocker/projects/foo";

    beforeEach(() => {
        vol.reset();

        vol.fromJSON({
            "wocker.config.json": JSON.stringify({
                projects: [
                    {
                        name: PROJECT_1_NAME,
                        path: PROJECT_1_PATH
                    }
                ]
            }, null, 4),
            [`projects/${PROJECT_1_NAME}/config.json`]: JSON.stringify({
                type: ProjectType.IMAGE,
                env: {
                    TEST: "FOO"
                }
            }, null, 4)
        }, WOCKER_DATA_DIR);

        vol.fromJSON({
            "wocker.config.json": JSON.stringify({})
        }, PROJECT_1_PATH);
    });

    const getContext = async () => {
        @Module({})
        class TestModule {}

        const context = await Factory.create(TestModule);

        return {
            container: context.get(Container),
            projectRepository: context.get(ProjectRepository)
        };
    };

    it("should", async () => {
        const {
            container,
            projectRepository
        } = await getContext();

        AsyncStorage.enterWith(container);

        const project = projectRepository.getByName(PROJECT_1_NAME);
        const config = project.configs.app;

        config.env.TEST = "foo";

        expect(config.env).toEqual(
            expect.objectContaining({
                TEST: "foo"
            })
        );

        expect(config.toString()).toContain(`"TEST": "foo"`);

        console.log(config.env);
        // console.log(config.toString());

        // config.state.buildArgs = {
        //     TEST: "123"
        // };

        // delete config.state.buildArgs;

        // console.log(config.state.buildArgs);

        // config.env = undefined as any;
        // config.type = ProjectType.PRESET;

        // console.log(config.toString());
        // console.log(config.env);

        config.ports.push("10:20");
        // console.log(config.get(["ports", "0"]), config.get(["ports", 0]));
        // console.log(Array.isArray(config.ports));
        // console.log(config.ports);
        // console.log("TEST" in config.env);
        // config.env.TEST = "foo";
        // delete config.env.TEST;
        // config.env.TEST_2 = "123";
        // config.env.TEST_3 = "123";

        // console.log("env:", config.env);
        // console.log(config.isDirty(), config.toString());

        // config.env = {
        //     TEST_1: "Test 1",
        //     TEST_2: "Test"
        // };
        //
        // config.env.TEST = "wqd";
        // // delete config.env.TEST_2;
        //
        // console.log(config.env.TEST);
        //
        // projectRepository.save(project);

        // const config = projectRepository.getConfig(PROJECT_1_NAME, ProjectConfigScopeEnum.APP);
        //
        // config.setEnv("TEST", "1");
        //
        // console.log(config.toObject());
        // console.log(vol.readFileSync(WOCKER_DATA_DIR + "/wocker.config.json").toString());
        // console.log(vol.readFileSync(WOCKER_DATA_DIR + `/projects/${PROJECT_1_NAME}/config.json`).toString());
        // console.log(vol.readFileSync(PROJECT_1_PATH + "/config.json"));
    });
});
