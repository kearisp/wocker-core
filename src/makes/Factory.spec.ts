import {Logger} from "@kearisp/cli";
import {describe, it, expect, beforeAll, afterEach} from "@jest/globals";

import {
    Module,
    Controller,
    Command,
    Injectable
} from "../decorators";
import {Provider} from "../types/Provider";
import {Factory} from "./Factory";


const TestProvider: Provider = {
    provide: ">_<",
    useValue: "LALALA"
};

@Injectable()
class TestService {}

@Controller()
class TestController {
    @Command("test")
    public async test() {
        return "response";
    }
}

@Module({
    imports: [],
    controllers: [TestController],
    providers: [
        TestProvider,
        TestService
    ]
})
class TestModule {}

describe("Factory", (): void => {
    beforeAll((): void => {
        Logger.mute();
    });

    afterEach((): void => {
        Logger.debug("-----------");
        Logger.mute();
    });

    it("Factory.create", async (): Promise<void> => {
        const testModule = await Factory.create(TestModule);
        const res = await testModule.run(["node", "cli", "test"]);

        expect(res).toBe("response");
    });
});
