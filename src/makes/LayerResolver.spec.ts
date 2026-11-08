import {describe, it, expect} from "@jest/globals";
import {LayerResolver, Rules, concat, first, merge, record} from "./LayerResolver";


type Service = {
    type?: string;
    env?: Record<string, string>;
    volumes?: string[];
};

type Data = {
    image?: string;
    env?: Record<string, string>;
    ports?: string[];
    volumes?: string[];
    services?: Record<string, Service>;
};

const destination = (volume: string): string => volume.split(":")[1];

const serviceRules: Rules<Service> = {
    type: first(),
    env: merge(),
    volumes: concat({by: destination})
};

const rules: Rules<Data> = {
    image: first(),
    env: merge(),
    ports: concat(),
    volumes: concat({by: destination}),
    services: record(serviceRules)
};

const make = (high: Data, low: Data) => new LayerResolver<Data>(rules, [
    {name: "project", priority: 100, data: low},
    {name: "machine", priority: 50, data: high}
]);

describe("LayerResolver", () => {
    it("should take the first defined scalar by priority", () => {
        expect(make({image: "a"}, {image: "b"}).resolve("image")).toBe("a");
        expect(make({}, {image: "b"}).resolve("image")).toBe("b");
        expect(make({}, {}).resolve("image")).toBeUndefined();
    });

    it("should treat an empty string as a defined value", () => {
        expect(make({image: ""}, {image: "b"}).resolve("image")).toBe("");
    });

    it("should merge maps key by key", () => {
        const resolver = make({env: {A: "1"}}, {env: {A: "0", B: "2"}});

        expect(resolver.resolve("env")).toEqual({A: "1", B: "2"});
    });

    it("should return empty containers when no layer has the field", () => {
        const resolver = make({}, {});

        expect(resolver.resolve("env")).toEqual({});
        expect(resolver.resolve("ports")).toEqual([]);
    });

    it("should concat lists from the lowest to the highest layer", () => {
        const resolver = make({ports: ["2:2"]}, {ports: ["1:1"]});

        expect(resolver.resolve("ports")).toEqual(["1:1", "2:2"]);
    });

    it("should let a higher layer win on the same key in concat", () => {
        const resolver = make(
            {volumes: ["./b:/data"]},
            {volumes: ["./a:/data", "./c:/cache"]}
        );

        expect(resolver.resolve("volumes")).toEqual(["./c:/cache", "./b:/data"]);
    });

    it("should sort layers by priority regardless of the given order", () => {
        const resolver = new LayerResolver<Data>(rules, [
            {name: "machine", priority: 50, data: {image: "a"}},
            {name: "project", priority: 100, data: {image: "b"}}
        ]);

        expect(resolver.resolve("image")).toBe("a");
    });

    it("should resolve nested service fields with their own rules", () => {
        const resolver = make(
            {services: {web: {env: {DB_HOST: "localhost"}}}},
            {services: {web: {env: {DB_HOST: "db", LOG: "info"}, type: "compose"}, queue: {type: "plugin"}}}
        );

        expect(resolver.resolve("services")).toEqual({
            web: {type: "compose", env: {DB_HOST: "localhost", LOG: "info"}},
            queue: {type: "plugin"}
        });
    });

    it("should resolve a value by path", () => {
        const resolver = make(
            {env: {VIRTUAL_HOST: "b.test"}, services: {web: {env: {DB_HOST: "localhost"}}}},
            {env: {VIRTUAL_HOST: "a.test", LOG: "info"}, services: {web: {env: {DB_HOST: "db", LOG: "info"}}}}
        );

        expect(resolver.resolve(["env", "VIRTUAL_HOST"])).toBe("b.test");
        expect(resolver.resolve(["env", "LOG"])).toBe("info");
        expect(resolver.resolve(["services", "web", "env", "DB_HOST"])).toBe("localhost");
        expect(resolver.resolve(["services", "web", "env", "LOG"])).toBe("info");
    });

    it("should treat a string as a single top-level key without parsing it", () => {
        const resolver = make({env: {"start.mode": "attach"}}, {});

        expect(resolver.resolve("env")).toEqual({"start.mode": "attach"});
        expect(resolver.resolve(["env", "start.mode"])).toBe("attach");
        expect(resolver.resolve(["env", "start", "mode"])).toBeUndefined();
    });

    it("should return undefined for a path that does not exist", () => {
        const resolver = make({}, {});

        expect(resolver.resolve(["env", "MISSING"])).toBeUndefined();
        expect(resolver.resolve(["services", "web", "env", "X"])).toBeUndefined();
        expect(resolver.resolve(["image", "x"])).toBeUndefined();
    });

    it("should not add empty containers to resolved services", () => {
        const resolver = make({}, {services: {queue: {type: "plugin"}}});

        expect(resolver.resolve("services")?.queue).toEqual({type: "plugin"});
    });
});
