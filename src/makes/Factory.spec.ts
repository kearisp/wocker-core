import {Module, Injectable} from "../decorators";


describe("Test", () => {
    @Injectable()
    class TestService {}

    @Module({
        providers: [TestService]
    })
    class TestModule {}

    it("test", () => {
        expect("").toBe("");
    });
});
