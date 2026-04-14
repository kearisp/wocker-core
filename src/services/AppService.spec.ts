import {describe, it, expect, beforeEach} from "@jest/globals";
import {vol} from "memfs";
import {Module} from "../decorators";
import {Container, Factory} from "../core";
import {AppService} from "./AppService";
import {AppFileSystemService} from "./AppFileSystemService";
import {WOCKER_VERSION_KEY} from "../env";
import {FileSystemDriver} from "../types";


describe("AppService", (): void => {
    beforeEach((): void => {
        vol.reset();
    });

    const getContext = async (version: string = "1.0.0") => {
        @Module({})
        class TestModule {}

        const context = await Factory.create(TestModule, {
            fsDriver: vol as unknown as FileSystemDriver
        });

        const container = context.get(Container);

        container.replace(WOCKER_VERSION_KEY, {
            provide: WOCKER_VERSION_KEY,
            useValue: version
        });

        return {
            appService: context.get(AppService),
            fs: context.get(AppFileSystemService)
        };
    };

    it("should return correct application version from WOCKER_VERSION constant", async (): Promise<void> => {
        const {appService} = await getContext();

        expect(appService.version).toBe("1.0.0");
    });

    it("should correctly compare versions using isVersionGT", async (): Promise<void> => {
        const {appService} = await getContext("1.1.0");

        expect(appService.isVersionGT("0.0.0")).toBeTruthy();
        expect(appService.isVersionGT("1.0.0")).toBeTruthy();
        expect(appService.isVersionGT("1.0.10")).toBeTruthy();
        expect(appService.isVersionGT("1.1.0")).toBeFalsy();
        expect(appService.isVersionGT("1.1.1")).toBeFalsy();
        expect(appService.isVersionGT("1.2.0")).toBeFalsy();
    });

    it("should correctly compare versions using isVersionGTE", async (): Promise<void> => {
        const {appService} = await getContext("1.0.24");

        expect(appService.isVersionGTE("0.0.0")).toBeTruthy();
        expect(appService.isVersionGTE("1.0.23")).toBeTruthy();
        expect(appService.isVersionGTE("1.0.24")).toBeTruthy();
        expect(appService.isVersionGTE("1.0.25")).toBeFalsy();
    });
});
