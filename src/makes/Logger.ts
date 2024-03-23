import {DI} from "./DI";
import {LogService} from "../services/LogService";


let loggerService: LogService;

export class Logger {
    public static install(ls: LogService) {
        loggerService = ls;
    }

    public static log(...data: any[]): void {
        loggerService.log(...data);
    }

    public static info(...data: any[]): void {
        loggerService.info(...data);
    }

    public static warn(...data: any[]): void {
        loggerService.warn(...data);
    }

    public static error(...data: any[]): void {
        loggerService.error(...data);
    }
}
