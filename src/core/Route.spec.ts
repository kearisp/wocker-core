import {describe, it, expect} from "@jest/globals";
import "reflect-metadata";
import {Route} from "./Route";
import {
    Controller,
    Command,
    Completion,
    Param,
    Option,
    Description
} from "../decorators";


describe("Route", (): void => {
    it("should correctly parse command parameters and options with descriptions", (): void => {
        const COMMAND = "test [name]";

        @Controller()
        class TestController {
            @Command(COMMAND)
            public testCommand(
                @Param("name")
                @Description("Param description")
                param1?: string,
                @Option("string-option", "s")
                @Description("String option description")
                stringOption?: string,
                @Option("bool-option", "b")
                @Description("Bool option description")
                boolOption?: boolean,
                @Option("number-option", "n")
                @Description("Number option description")
                numberOption?: number
            ) {}
        }

        const route = new Route(TestController, "testCommand");

        expect(route.commandNames).toEqual([COMMAND]);
        expect(route.args).toEqual([
            {
                type: "param",
                name: "name",
                params: {
                    description: "Param description"
                }
            },
            {
                type: "option",
                name: "string-option",
                params: {
                    type: "string",
                    alias: "s",
                    description: "String option description"
                }
            },
            {
                type: "option",
                name: "bool-option",
                params: {
                    type: "boolean",
                    alias: "b",
                    description: "Bool option description"
                }
            },
            {
                type: "option",
                name: "number-option",
                params: {
                    type: "number",
                    alias: "n",
                    description: "Number option description"
                }
            }
        ]);
    });

    it("should handle legacy option parameter format", (): void => {
        class TestController {
            @Command("test")
            public testRoute(
                @Option("number-option", {
                    type: "number",
                    alias: "n",
                    description: "Number option description"
                })
                numberOption?: any
            ) {}
        }

        const route = new Route(TestController, "testRoute");

        expect(route.commandNames).toEqual(["test"]);
        expect(route.args).toEqual([
            {
                name: "number-option",
                type: "option",
                params: {
                    type: "number",
                    alias: "n",
                    description: "Number option description"
                }
            }
        ]);
    });

    it("should return empty command names for non-existent method", (): void => {
        class TestController {
            @Command("test-command")
            public testRoute() {}
        }

        const route = new Route(TestController, "wrongMethod");

        expect(route.commandNames).toEqual([]);
        expect(route.args).toEqual([]);
    });
});
