import {describe, it, expect, beforeEach} from "@jest/globals";
import {vol} from "memfs";
import {FileSystem} from "./";
import {FileSystemDriver} from "../types";
import {DATA_DIR} from "../env";


describe("FileSystem", (): void => {
    const fs = new FileSystem(DATA_DIR, vol as unknown as FileSystemDriver);

    beforeEach((): void => {
        vol.reset();
    });

    it("should return correct path", (): void => {
        expect(fs.path("file.txt")).toBe(`${DATA_DIR}/file.txt`);
        expect(fs.path("dir", "file.txt")).toBe(`${DATA_DIR}/dir/file.txt`);
    });

    it("should return basename", (): void => {
        expect(fs.basename("dir/file.txt")).toBe("file.txt");
    });

    it("should check if file exists", (): void => {
        vol.fromJSON({
            "file.txt": "content"
        }, DATA_DIR);

        expect(fs.exists("file.txt")).toBe(true);
        expect(fs.exists("missing.txt")).toBe(false);
    });

    it("should get file stats", (): void => {
        vol.fromJSON({
            "file.txt": "content"
        }, DATA_DIR);

        const stats = fs.stat("file.txt");

        expect(stats.isFile()).toBe(true);
    });

    it("should create directory", (): void => {
        fs.mkdir("new-dir");

        expect(fs.exists("new-dir")).toBe(true);
    });

    it("should read directory content", (): void => {
        vol.fromJSON({
            "sub-dir/sub-file1.txt": "sub-content1",
            "sub-dir/sub-file2.txt": "sub-content2",
            "file1.txt": "content1",
            "file2.txt": "content2"
        }, DATA_DIR);

        expect(fs.readdir()).toEqual([
            "file1.txt",
            "file2.txt",
            "sub-dir"
        ]);

        expect(fs.readdir("sub-dir")).toEqual([
            "sub-file1.txt",
            "sub-file2.txt"
        ]);

        expect(fs.readdir("", {recursive: true})).toEqual([
            "file1.txt",
            "file2.txt",
            "sub-dir",
            "sub-dir/sub-file1.txt",
            "sub-dir/sub-file2.txt"
        ]);
    });

    it("should read and write JSON", (): void => {
        const data = {key: "value"};

        fs.writeJSON("data.json", data);

        expect(fs.readJSON("data.json")).toEqual(data);
    });

    it("should write and read file", (): void => {
        const content = "test content";

        fs.writeFile("file.txt", content);

        expect(fs.readFile("file.txt").toString()).toBe(content);
    });

    it("should append to file", (): void => {
        const existingLine = "foo",
              appendLine = "bar";

        vol.fromJSON({
            "file.txt": existingLine
        }, DATA_DIR);

        fs.appendFile("file.txt", appendLine);

        expect(vol.readFileSync(`${DATA_DIR}/file.txt`).toString()).toBe(`${existingLine}${appendLine}`);
    });

    it("should read lines", async (): Promise<void> => {
        const line1 = "foo",
              line2 = "bar",
              line3 = "tor";

        vol.fromJSON({
            "file.txt": `${line1}\n${line2}\n${line3}\n`
        }, DATA_DIR);

        const stream = fs.createReadlineStream("file.txt");

        const handleData = jest.fn();

        await new Promise((resolve, reject) => {
            stream.on("data", handleData);
            stream.on("end", resolve);
            stream.on("error", reject);
        });

        expect(handleData).toHaveBeenCalledTimes(3);
        expect(handleData).toHaveBeenNthCalledWith(1, line1);
        expect(handleData).toHaveBeenNthCalledWith(2, line2);
        expect(handleData).toHaveBeenNthCalledWith(3, line3);

        const stream2 = fs.createReadlineStream("file.txt", {
            start: 2,
            end: 4
        });

        const handle2Data = jest.fn();

        await new Promise<void>((resolve, reject) => {
            stream2.on("data", (data) => {
                handle2Data(data);
            });
            stream2.on("end", resolve);
            stream2.on("error", reject);
        });

        expect(handle2Data).toHaveBeenCalledTimes(2);
        expect(handle2Data).toHaveBeenNthCalledWith(1, line2);
        expect(handle2Data).toHaveBeenNthCalledWith(2, line3);
    });

    it("should read bytes", (): void => {
        const testFile = "test.txt",
              testEmptyFile = "test-empty.txt",
              offset = 10,
              text1 = "foo",
              text2 = "bar",
              content = `${"-".repeat(offset)}${text1}${text2}`;

        vol.fromJSON({
            [`${fs.path(testFile)}`]: content,
            [`${fs.path(testEmptyFile)}`]: ""
        });

        expect(fs.readBytes(testFile).toString()).toBe(content);
        expect(fs.readBytes(testFile, offset, text1.length).toString()).toBe(text1);
        expect(fs.readBytes(testFile, -text2.length).toString()).toBe(text2);
        expect(fs.readBytes(testEmptyFile).toString()).toBe("");
    });

    it("should getting line position", async () => {
        const testFile = "test.txt",
              testOneLineFile = "test-one-line.txt",
              testEmptyFile = "test-empty.txt",
              firstLine = "foo",
              secondList = "second-foo",
              preLastLine = "bar",
              lastLine = "last-bar";

        vol.fromJSON({
            [testFile]: Array.from({length: 100})
                .map((_, index, arr) => {
                    if(index === 0) {
                        return firstLine;
                    }

                    if(index === 1) {
                        return secondList;
                    }

                    if(index === arr.length - 2) {
                        return preLastLine;
                    }

                    if(index === arr.length - 1) {
                        return lastLine;
                    }

                    const num = `${index + 1}`.padStart(3, "0");

                    return `test-line-${num}`;
                })
                .join("\n"),
            [testOneLineFile]: "One line file",
            [testEmptyFile]: ""
        }, DATA_DIR);

        expect(() => fs.getLinePosition(testFile, 0)).toThrowError();
        expect(fs.getLinePosition(testFile, 1)).toBe(0);
        expect(fs.readBytes(testFile, fs.getLinePosition(testFile, 2), secondList.length).toString()).toBe(secondList);
        expect(fs.readBytes(testFile, fs.getLinePosition(testFile, -2), preLastLine.length).toString()).toBe(preLastLine);
        expect(fs.readBytes(testFile, fs.getLinePosition(testFile, -1)).toString()).toBe(lastLine);
        expect(fs.getLinePosition(testFile, 101)).toBe(fs.stat(testFile).size);
        expect(fs.getLinePosition(testFile, -101)).toBe(0);
        expect(fs.getLinePosition(testOneLineFile, 1)).toBe(0);
        expect(fs.getLinePosition(testEmptyFile, 1)).toBe(0);
    });

    it("should open and close file", (): void => {
        vol.fromJSON({
            "test.txt": '>>>'
        }, DATA_DIR);

        const file = fs.open("test.txt", "r"),
              stat = file.stat();

        expect(stat).not.toBeNull();

        file.close();

        expect(() => file.stat()).toThrowError();
    });

    it("should watch file", async (): Promise<void> => {
        const testFile = "test.txt";

        vol.fromJSON({
            [`${fs.path(testFile)}`]: "1"
        });

        const handleChange = jest.fn();

        const watcher = fs.watch(testFile);

        watcher.on("change", handleChange);

        fs.appendFile(testFile, "line1\n");
        fs.appendFile(testFile, "line2\n");

        watcher.close();

        expect(handleChange).toHaveBeenCalledTimes(2);
        expect(handleChange).toHaveBeenNthCalledWith(1, "change", testFile);
        expect(handleChange).toHaveBeenNthCalledWith(2, "change", testFile);
    });
});
