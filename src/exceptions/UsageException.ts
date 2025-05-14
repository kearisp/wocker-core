export class UsageException extends Error {
    public constructor(message: string) {
        super(message);
        this.name = "UsageException";
    }
}
