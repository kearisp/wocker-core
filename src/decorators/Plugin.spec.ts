import {describe, it, expect} from "@jest/globals";
import "reflect-metadata";
import {Plugin} from "./Plugin";
import {PLUGIN_NAME_METADATA} from "../env";


describe("Plugin", (): void => {
    it("should set plugin metadata for decorated class", (): void => {
        const name = "test-plugin-name";

        @Plugin({
            name: name
        })
        class TestPlugin {}

        expect(Reflect.getMetadata(PLUGIN_NAME_METADATA, TestPlugin)).toBe(name);
    });
});
