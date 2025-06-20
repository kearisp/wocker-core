import {describe, it, expect} from "@jest/globals";
import {Container} from "./Container";
import {ModuleWrapper} from "./ModuleWrapper";


describe("Container", (): void => {
    it("should add module", async (): Promise<void> => {
        class ModuleType {}

        const container = new Container();
        const module = new ModuleWrapper(container, ModuleType);

        container.addModule(ModuleType, module);

        expect(1).toBe(1);
    });
});
