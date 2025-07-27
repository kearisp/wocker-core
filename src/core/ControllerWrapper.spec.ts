import {describe, it, expect} from "@jest/globals";
import "reflect-metadata";
import {CommandInput} from "@kearisp/cli";
import {Controller, Description, Command, Option, Param, Completion} from "../decorators";
import {ControllerWrapper} from "./ControllerWrapper";


describe("ControllerWrapper", (): void => {
    it("should has a route", (): void => {
        @Controller()
        class TestController {
            @Command("test-command [test-param]")
            @Description("Test command description")
            public testCommand(
                @Param("test-param")
                @Description("Test param description")
                _testParam?: string,
                @Option("test-option", "t")
                @Description("Test option description")
                _stringValue?: string,
                @Option("test-option2", "T")
                @Description("Test2 description")
                _boolValue?: boolean
            ): void {}

            @Completion("test-option")
            public testCompletion(
                @Param("test-param")
                @Description("Test param description")
                _testParam?: string
            ): string[] {
                return [];
            }
        }

        const wrapper = new ControllerWrapper(null as any, TestController),
              commands = wrapper.commands,
              completions = wrapper.completions;

        expect(commands.length).toBe(1);
        expect(commands[0].method).toBe("testCommand");
        expect(commands[0].description).toBe("Test command description");
        expect(commands[0].commandNames).toEqual(["test-command [test-param]"]);
        expect(commands[0].args).toEqual([
            {
                type: "param",
                name: "test-param",
                params: {
                    description: "Test param description"
                }
            },
            {
                type: "option",
                name: "test-option",
                params: {
                    alias: "t",
                    type: "string",
                    description: "Test option description"
                }
            },
            {
                type: "option",
                name: "test-option2",
                params: {
                    alias: "T",
                    type: "boolean",
                    description: "Test2 description"
                }
            }
        ]);
        expect(completions.length).toBe(1);
        expect(completions[0].method).toBe("testCompletion");
        expect(completions[0].args).toEqual([
            {
                type: "param",
                name: "test-param",
                params: {
                    description: "Test param description"
                }
            }
        ]);
        expect(completions[0].completions).toEqual([
            {
                name: "test-option"
            }
        ]);
    });

    it("should find completions", (): void => {
        @Controller()
        class TestController {
            @Completion("foo")
            public foo(): string[] {
                return [];
            }

            @Completion("bar", "test-command")
            public bar(): string[] {
                return [];
            }
        }

        const wrapper = new ControllerWrapper(null as any, TestController);

        const fooCompletions = wrapper.getCompletionCommands("foo", "test-command");

        expect(fooCompletions.length).toBe(1);

        const barCompletions = wrapper.getCompletionCommands("bar", "test-command");

        expect(barCompletions.length).toBe(1);
    });

    it("should run controller route", async (): Promise<void> => {
        @Controller()
        class TestController {
            @Command("test-command [test-param]")
            public testCommand(
                @Param("test-param")
                _testParam?: string,
                @Option("test-option", "o")
                _testOption?: string,
                @Option("test-options", "0")
                _testOptions?: string[]
            ): string {
                return "Command result";
            }
        }

        const wrapper = new ControllerWrapper(null as any, TestController);

        const input = new CommandInput({"test-param": "Value"}, [
            {name: "test-option", value: "option-value"},
            {name: "test-options", value: "first-option"}
        ]);

        const result = await wrapper.run(wrapper.commands[0], input);

        expect(result).toBe("Command result");
    });

    it("should initialize with empty commands and completions if no valid controller is provided", (): void => {
        const wrapper = new ControllerWrapper(null as any, {provide: "TEST", useValue: "TEST"} as any);

        expect(wrapper.commands.length).toBe(0);
        expect(wrapper.completions.length).toBe(0);
    });
});
