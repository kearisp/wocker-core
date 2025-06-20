import {format as dateFormat} from "date-fns/format";
import {Injectable} from "../decorators";
import {AppConfigService} from "./AppConfigService";
import {AppFileSystemService} from "./AppFileSystemService";


@Injectable("LOG_SERVICE")
export class LogService {
    public constructor(
        protected readonly appConfigService: AppConfigService,
        protected readonly fs: AppFileSystemService
    ) {}

    protected get logName(): string {
        return "ws.log";
    }

    protected _log(type: string, ...data: any[]): void {
        if(type === "debug" && !this.appConfigService.config.debug) {
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
        this._log("debug", ...data);
    }

    public log(...data: any[]): void {
        this._log("log", ...data);
    }

    public info(...data: any[]): void {
        this._log("info", ...data);
    }

    public warn(...data: any[]): void {
        this._log("warn", ...data);
    }

    public error(...data: any[]): void {
        this._log("error", ...data);
    }

    public clear(): void {
        this.fs.writeFile(this.logName, "");
    }
}
