import {Version} from "./Version";
import {VersionRule} from "./VersionRule";


export class VersionRange {
    public constructor(
        protected rules: VersionRule[][]
    ) {}

    public match(version: string | Version, withTag?: boolean): boolean {
        if(typeof version === "string") {
            version = Version.parse(version);
        }

        return this.rules.some((rules) => {
            return rules.every((rule) => {
                return rule.match(version, withTag);
            });
        });
    }

    public static parse(range: string): VersionRange {
        const rules = range.split("||").map((group) => {
            return group
                .trim()
                .split(/\s+/)
                .filter((rule) => rule.length > 0)
                .map((rule) => VersionRule.parse(rule));
        });

        return new VersionRange(rules);
    }
}
