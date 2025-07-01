import {AsyncStorage} from "../core";
import {LogService} from "../services";


export class Logger {
    protected static getLogService(): any | undefined {
        const container = AsyncStorage.getStore();

        if(!container) {
            return;
        }

        return container.getProvider(LogService)?.instance;
    }

    public static log(...data: any[]): void {
        Logger.getLogService()?.log(...data);
    }

    public static info(...data: any[]): void {
        Logger.getLogService()?.info(...data);
    }

    public static warn(...data: any[]): void {
        Logger.getLogService()?.warn(...data);
    }

    public static error(...data: any[]): void {
        Logger.getLogService()?.error(...data);
    }
}
