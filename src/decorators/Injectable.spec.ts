import {describe, it, expect} from "@jest/globals";
import "reflect-metadata";
import {Injectable} from "./";
import {INJECTABLE_WATERMARK, INJECT_TOKEN_METADATA} from "../env";


describe("Injectable", (): void => {
    it("should mark class as injectable", (): void => {
        @Injectable()
        class TestClass {}

        expect(Reflect.getMetadata(INJECTABLE_WATERMARK, TestClass)).toBe(true);
        expect(Reflect.hasMetadata(INJECT_TOKEN_METADATA, TestClass)).toBe(false);
    });

    it("should set inject token when string provided", (): void => {
        const token = "test-token";

        @Injectable(token)
        class TestClass {}

        expect(Reflect.getMetadata(INJECTABLE_WATERMARK, TestClass)).toBe(true);
        expect(Reflect.getMetadata(INJECT_TOKEN_METADATA, TestClass)).toBe(token);
    });

    it("should set inject token when object with token provided", (): void => {
        const token = "test-token";

        @Injectable({
            token
        })
        class TestClass {}

        expect(Reflect.getMetadata(INJECTABLE_WATERMARK, TestClass)).toBe(true);
        expect(Reflect.getMetadata(INJECT_TOKEN_METADATA, TestClass)).toBe(token);
    });

    it("should not set token metadata when no token provided", (): void => {
        @Injectable({})
        class TestClass {}

        expect(Reflect.getMetadata(INJECTABLE_WATERMARK, TestClass)).toBe(true);
        expect(Reflect.hasMetadata(INJECT_TOKEN_METADATA, TestClass)).toBe(false);
    });
});
