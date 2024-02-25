abstract class LogService {
    public abstract log(...data: any[]): void;
    public abstract info(...data: any[]): void;
    public abstract warn(...data: any[]): void;
    public abstract error(...data: any[]): void;
}


export {LogService};
