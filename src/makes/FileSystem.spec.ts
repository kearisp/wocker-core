import {describe, it, expect, beforeEach} from "@jest/globals";
import {vol} from "memfs";
import {FileSystem} from "./";


describe("FileSystem", () => {
    beforeEach(() => {
        vol.reset();
    });

    it("should return correct path", () => {
        const fs = new FileSystem("/test");
        expect(fs.path("file.txt")).toBe("/test/file.txt");
        expect(fs.path("dir", "file.txt")).toBe("/test/dir/file.txt");
    });

    it("should return basename", () => {
        const fs = new FileSystem("/test");
        expect(fs.basename("dir/file.txt")).toBe("file.txt");
    });

    it("should check if file exists", () => {
        const fs = new FileSystem("/test");
        vol.fromJSON({
            "/test/file.txt": "content"
        });

        expect(fs.exists("file.txt")).toBe(true);
        expect(fs.exists("missing.txt")).toBe(false);
    });

    it("should get file stats", () => {
        const fs = new FileSystem("/test");
        vol.fromJSON({
            "/test/file.txt": "content"
        });

        const stats = fs.stat("file.txt");
        expect(stats.isFile()).toBe(true);
    });

    it("should create directory", () => {
        const fs = new FileSystem("/");

        fs.mkdir("new-dir");

        expect(fs.exists("new-dir")).toBe(true);
    });

    it("should read directory content", () => {
        const fs = new FileSystem("/");
        vol.fromJSON({
            "/file1.txt": "content1",
            "/file2.txt": "content2"
        });

        const files = fs.readdir("");
        expect(files).toContain("file1.txt");
        expect(files).toContain("file2.txt");
    });

    it("should read and write JSON", () => {
        const fs = new FileSystem("/");
        const data = {key: "value"};

        fs.writeJSON("data.json", data);
        const read = fs.readJSON("data.json");

        expect(read).toEqual(data);
    });

    it("should write and read file", () => {
        const fs = new FileSystem("/");
        const content = "test content";

        fs.writeFile("file.txt", content);
        const read = fs.readFile("file.txt");

        expect(read.toString()).toBe(content);
    });

    it("should append to file", () => {
        const fs = new FileSystem("/"),
              existingLine = "foo",
              appendLine = "bar";

        vol.fromJSON({
            "file.txt": existingLine
        }, "/");

        fs.appendFile("file.txt", appendLine);

        expect(vol.readFileSync("/file.txt").toString()).toBe(`${existingLine}${appendLine}`);
    });
});
