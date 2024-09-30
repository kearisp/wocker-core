import {Logger} from "@kearisp/cli";
import {describe, it, expect, beforeEach} from "@jest/globals";
import {Container} from "./Container";

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

        const container = new Container();
        const module = new Module(container, ModuleType);

        const instanceWrapper = new InstanceWrapper(module, Service);

        expect("").toBe("");
    });
});
