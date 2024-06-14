import {Logger} from "@kearisp/cli";
import {describe, it, expect, beforeEach} from "@jest/globals";

import {
    Module,
    Controller,
    Command,
    Injectable
} from "../decorators";
import {Provider} from "../types/Provider";
import {Factory} from "./Factory";
import {Container} from "./Container";


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

@Module({})
class Test2Module {}

describe("Factory.scan", () => {
    beforeEach(() => {
        Logger.debug("-----------");
        Logger.mute();
    });

    it("Should", async () => {
        // @ts-ignore
        const factory = new Factory();

        await factory.scan(TestModule);

        const container = factory.getContainer();

        expect(container).toBeInstanceOf(Container);

        const testModule = container.getModule(TestModule);

        expect(testModule).toBeDefined();

        const testService = testModule.get(TestService);

        expect(testService).toBeInstanceOf(TestService);

        const v = testModule.get(TestProvider.provide);

        Logger.info(v);
    });
});

describe("Factory.create", () => {
    beforeEach(() => {
        Logger.debug("-----------");
        Logger.mute();
    });

    it("Should be created", async () => {
        // Logger.unmute();

        const testModule = await Factory.create(TestModule);
        const res = await testModule.run(["node", "cli", "test"]);

        expect(res).toBe("response");
    });
});
