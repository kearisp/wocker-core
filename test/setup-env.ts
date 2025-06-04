import {beforeEach, afterEach} from "@jest/globals";
import {Logger} from "@kearisp/cli";


beforeEach((): void => {
    Logger.mute();
});

afterEach((): void => {
    const {
        currentTestName = "Unknown",
        testPath = "/"
    } = expect.getState();

    const fileName = testPath.split("/").pop() || "",
          message = `${fileName}: ${currentTestName}`;

    Logger.debug("┌" + "─".repeat(message.length + 2) + "┐");
    Logger.debug(`│ ${message} │`);
    Logger.debug("└" + "─".repeat(message.length + 2) + "┘");
    Logger.mute();
});
