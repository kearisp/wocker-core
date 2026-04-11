import {describe, it, expect} from "@jest/globals";
import {JsonEditor} from "./JsonEditor";


describe("JsonEditor", () => {
    it("should read property from state", () => {
        const json = `{"name": "test"}`;
        const editor = new JsonEditor<{name: string;}>(json);

        expect(editor.state.name).toBe("test");
    });

    it("should write property to state", () => {
        const json = `{"name": "test"}`;
        const editor = new JsonEditor<{name: string;}>(json);

        editor.state.name = "new value";

        expect(editor.state.name).toBe("new value");
        expect(editor.toString()).toContain("\"name\": \"new value\"");
    });

    it("should create new property", () => {
        const json = `{}`;
        const editor = new JsonEditor<any>(json);

        editor.state.foo = "bar";

        expect(editor.state.foo).toBe("bar");
        expect(editor.toString()).toContain("\"foo\": \"bar\"");
    });

    it("should handle nested objects", () => {
        const json = `{"a": {"b": 1}}`;
        const editor = new JsonEditor<any>(json);

        expect(editor.state.a.b).toBe(1);

        editor.state.a.b = 2;
        expect(editor.state.a.b).toBe(2);
        expect(editor.toString()).toContain("\"b\": 2");
    });

    it("should handle arrays", () => {
        const json = `{"list": [1, 2, 3]}`;
        const editor = new JsonEditor<any>(json);

        expect(editor.state.list[0]).toBe(1);
        expect(editor.state.list[1]).toBe(2);

        editor.state.list[1] = 20;
        expect(editor.state.list[1]).toBe(20);
        expect(editor.toString()).toContain("20");
    });

    it("should delete property", () => {
        const json = `{"a": 1, "b": 2}`;
        const editor = new JsonEditor<any>(json);

        delete editor.state.a;

        expect(editor.state.a).toBeUndefined();
        expect(editor.state.b).toBe(2);
        expect(editor.toString()).not.toContain("\"a\": 1");
    });

    it("should return isDirty status", () => {
        const json = `{"a": 1}`;
        const editor = new JsonEditor<any>(json);

        expect(editor.isDirty()).toBe(false);

        editor.state.a = 2;
        expect(editor.isDirty()).toBe(true);

        editor.state.a = 1;
        expect(editor.isDirty()).toBe(false);
    });

    it("should use get and set methods", () => {
        const json = `{"a": 1}`;
        const editor = new JsonEditor<any>(json);

        expect(editor.get("a")).toBe(1);

        editor.set("b", 2);
        expect(editor.get("b")).toBe(2);
        expect(editor.state.b).toBe(2);
    });

    it("should handle deep paths in get/set", () => {
        const json = `{"a": {"b": {"c": 3}}}`;
        const editor = new JsonEditor<any>(json);

        expect(editor.get("a.b.c")).toBe(3);
        expect(editor.get(["a", "b", "c"])).toBe(3);

        editor.set("a.b.d", 4);
        expect(editor.state.a.b.d).toBe(4);
    });
});
