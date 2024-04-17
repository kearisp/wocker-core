import {describe, it, expect} from "@jest/globals";

import {Injectable} from "../decorators";
import {Container} from "./Container";
import {Factory} from "./Factory";
import {Module} from "./Module";


@Injectable()
class TestService {}

// @Module({
//     controllers: [],
//     providers: [
//         TestService
//     ]
// })
// class TestModule {}

describe("Container.hasModule", () => {
    it("ww", async () => {
        class ModuleType {}

        const module = new Module(ModuleType);
        // const app = await Factory.create(TestModule);
        // const module = new Module();
        const container = new Container();

        container.addModule(ModuleType, module);

        // container.addModule(TestModule);

        expect(1).toBe(1);
    });
});
