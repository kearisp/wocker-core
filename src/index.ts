import "reflect-metadata";
export {Cli, CommandNotFoundError} from "@kearisp/cli";
export * from "./core";
export * from "./decorators";
export * from "./exceptions";
export * from "./makes";
export * from "./services";
export {
    /**
     * @deprecated since v1.0.24. Use EventService instead.
     * This export is maintained for backward compatibility.
     * The AppEventsService class has been renamed to EventService.
     */
    EventService as AppEventsService
} from "./services";
export * from "./types";
export {
    IS_MODULE_METADATA,
    MODULE_METADATA,
    PLUGIN_NAME_METADATA,
    PLUGIN_DIR_KEY,
    WOCKER_VERSION_KEY,
    WOCKER_DATA_DIR_KEY
} from "./env";
