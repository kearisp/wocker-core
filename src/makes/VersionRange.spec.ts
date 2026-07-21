import {describe, it, expect} from "@jest/globals";
import {VersionRange} from "./VersionRange";


describe("VersionRange", (): void => {
    it.each([
        {pattern: "1.x.x", version: "1.2.3"},
        {pattern: "1.x.x || 2.x.x", version: "1.5.0"},
        {pattern: "1.x.x || 2.x.x", version: "2.0.0"},
        {pattern: ">=1.2.7 <1.3.0", version: "1.2.8"},
        {pattern: ">=1.2.7 <1.3.0 || 2.x.x", version: "2.5.0"},
        {pattern: "x", version: "5.6.7"}
    ])("$version should match $pattern", ({version, pattern}): void => {
        expect(VersionRange.parse(pattern).match(version)).toBeTruthy();
    });

    it.each([
        {pattern: "1.x.x || 2.x.x", version: "3.0.0"},
        {pattern: "1.x.x || 2.x.x", version: "0.9.9"},
        {pattern: ">=1.2.7 <1.3.0", version: "1.3.0"},
        {pattern: ">=1.2.7 <1.3.0", version: "1.2.6"},
        {pattern: ">=1.2.7 <1.3.0 || 2.x.x", version: "1.3.0"}
    ])("$version shouldn't match $pattern", ({pattern, version}): void => {
        expect(VersionRange.parse(pattern).match(version)).toBeFalsy();
    });
});