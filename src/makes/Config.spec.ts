import {describe, it, expect, beforeEach} from "@jest/globals";
import {Logger} from "@kearisp/cli";

import {Config, ConfigProperties} from "./Config";


describe("Config", () => {
    beforeEach(() => {
        Logger.debug("-----------");
        Logger.mute();
    });

    class TestConfig extends Config {
        public constructor(data: ConfigProperties) {
            super(data);
        }

        public async save() {
            //
        }
    }

    it("", () => {
        const config = new TestConfig({
            // @ts-ignore
            plugins: undefined,
            projects: []
        });

        const PLUGIN_1 = "test-1";

        config.addPlugin(PLUGIN_1);
        config.addPlugin(PLUGIN_1);

        expect(config.plugins).toEqual([PLUGIN_1]);

        config.removePlugin(PLUGIN_1);

        expect(config.plugins).toEqual([]);
    });
});
