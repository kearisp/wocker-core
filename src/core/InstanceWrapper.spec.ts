import {describe, it, expect} from "@jest/globals";
import {Container} from "./Container";
import {InstanceWrapper} from "./InstanceWrapper";
import {Module} from "./Module";


describe("InstanceWrapper", (): void => {
    it("", (): void => {
        class ModuleType {}
        class Service {}

        const container = new Container();
        const module = new Module(container, ModuleType);

        const instanceWrapper = new InstanceWrapper(module, Service);

        expect("").toBe("");
    });
});
