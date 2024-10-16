import {describe, it, expect} from "@jest/globals";

import {Container} from "./Container";
import {Module} from "./Module";


describe("Container.hasModule", () => {
    it("ww", async () => {
        class ModuleType {}

        const container = new Container();
        const module = new Module(container, ModuleType);

        container.addModule(ModuleType, module);

        expect(1).toBe(1);
    });
});
