enum LogLevelEnum {
    DEBUG = "debug",
    LOG = "log",
    INFO = "info",
    WARNING = "warn",
    ERROR = "error"
}

export type LogLevel = LogLevelEnum;

export const LogLevel = Object.assign({}, LogLevelEnum, {
    values() {
        return Object.values(LogLevelEnum);
    },
    isGTE(a: LogLevelEnum, b: LogLevelEnum) {
        const values = LogLevel.values();

        return values.indexOf(a) <= values.indexOf(b);
    }
});
