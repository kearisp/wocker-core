import {LogService} from "../services/LogService";


let loggerService: LogService;

export class Logger {
    public static install(ls: LogService): void {
        loggerService = ls;
    }

    public static log(...data: any[]): void {
        if(!loggerService) {
            return;
        }

        loggerService.log(...data);
    }

    public static info(...data: any[]): void {
        if(!loggerService) {
            return;
        }

        loggerService.info(...data);
    }

    public static warn(...data: any[]): void {
        if(!loggerService) {
            return;
        }

        loggerService.warn(...data);
    }

    public static error(...data: any[]): void {
        if(!loggerService) {
            return;
        }

        loggerService.error(...data);
    }
}
