import {describe, it, expect} from "@jest/globals";
import {Preset, PresetProperties} from "./Preset";

describe("Preset", () => {
    class TestPreset extends Preset {
        public constructor(data: PresetProperties) {
            super(data);
        }

        public async save() {}

        public async delete() {}
    }

    it("should provide data", () => {
        const props: PresetProperties = {
            name: "test-preset",
            version: "1.0.0",
            type: "test",
            image: "test-image",
            dockerfile: "dockerfile",
            buildArgsOptions: {
                TEST: {
                    type: "string"
                }
            }
        };

        const preset = new TestPreset(props),
              data = preset.toObject();

        for(const key in props) {
            expect((preset as any)[key]).toEqual((props as any)[key]);
            expect((data as any)[key]).toEqual((props as any)[key]);
        }
    });
});
