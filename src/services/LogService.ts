import {format as dateFormat} from "date-fns/format";
import {Injectable} from "../decorators";
import {ProcessService} from "./ProcessService";
import {AppFileSystemService} from "./AppFileSystemService";
import {LogLevel} from "../types";


@Injectable("LOG_SERVICE")
export class LogService {
    public constructor(
        protected readonly processService: ProcessService,
        protected readonly fs: AppFileSystemService
    ) {}

    public get logLevel(): LogLevel {
        const level: LogLevel = this.processService.getEnv("WS_LOG_LEVEL", LogLevel.WARNING) as LogLevel;

        if(LogLevel.values().includes(level)) {
            return level;
        }

        return LogLevel.WARNING;
    }

    protected get logName(): string {
        return "ws.log";
    }

    protected _log(type: LogLevel, ...data: any[]): void {
        if(!LogLevel.isGTE(this.logLevel, type)) {
            return;
        }

        const time = dateFormat(new Date(), "yyyy-MM-dd HH:mm:ss");
        const logData = data.map((item): string => {
            return typeof item !== "string" ? JSON.stringify(item) : item;
        }).join(" ");

        if(!this.fs.exists(this.logName)) {
            this.fs.writeFile(this.logName, "");
        }

        this.fs.appendFile(this.logName, `[${time}] ${type}: ${logData}\n`);
    }

    public debug(...data: any[]): void {
        this._log(LogLevel.DEBUG, ...data);
    }

    public log(...data: any[]): void {
        this._log(LogLevel.LOG, ...data);
    }

    public info(...data: any[]): void {
        this._log(LogLevel.INFO, ...data);
    }

    public warn(...data: any[]): void {
        this._log(LogLevel.WARNING, ...data);
    }

    public error(...data: any[]): void {
        this._log(LogLevel.ERROR, ...data);
    }

    public clear(): void {
        this.fs.writeFile(this.logName, "");
    }
}
