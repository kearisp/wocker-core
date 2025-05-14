import {describe, it, expect} from "@jest/globals";
import "reflect-metadata";
import {Global} from "./Global";
import {IS_GLOBAL_METADATA} from "../env";


describe("Global", (): void => {
    it("should set global metadata flag on decorated class", (): void => {
        @Global()
        class GlobalModule {}

        expect(Reflect.getMetadata(IS_GLOBAL_METADATA, GlobalModule)).toBeTruthy();
    });
});
