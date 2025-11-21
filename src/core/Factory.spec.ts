import {describe, it, expect} from "@jest/globals";
import "reflect-metadata";
import {
    Module,
    Controller,
    Command,
    Injectable
} from "../decorators";
import {ProviderType} from "../types";
import {Factory} from "./Factory";


const TestProvider: ProviderType = {
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
    it("Factory.create", async (): Promise<void> => {
        const testModule = await Factory.create(TestModule),
              res = await testModule.run(["node", "cli", "test"]);

        expect(res).toBe("response");
    });
});
