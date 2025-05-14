import {describe, it, expect} from "@jest/globals";
import {UsageException} from "./";


describe("UsageException", () => {
    it("should create an instance of UsageException", () => {
        const message = "test error message",
              error = new UsageException(message);

        expect(error).toBeInstanceOf(UsageException);
        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe("UsageException");
        expect(error.message).toBe(message);
    });
});
