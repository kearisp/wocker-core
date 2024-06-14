import {Logger} from "@kearisp/cli";
import {describe, it, expect, beforeEach} from "@jest/globals";

import {InstanceWrapper} from "./InstanceWrapper";
import {Module} from "./Module";


describe("InstanceWrapper", () => {
    beforeEach(() => {
        Logger.debug("-----------");
        Logger.mute();
    });

    it("", () => {
        class ModuleType {}
        class Service {}

        const module = new Module(ModuleType);

        const instanceWrapper = new InstanceWrapper(module, Service, Service);

        expect("").toBe("");
    });
});
