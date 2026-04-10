import {Injectable, Inject} from "../decorators";
import {FileSystemDriver} from "../types";
import {FileSystem} from "../makes/FileSystem";
import {
    WOCKER_DATA_DIR_KEY,
    FILE_SYSTEM_DRIVER_KEY
} from "../env";


@Injectable("APP_FILE_SYSTEM_SERVICE")
export class AppFileSystemService extends FileSystem {
    public constructor(
        @Inject(WOCKER_DATA_DIR_KEY)
        dataDir: string,
        @Inject(FILE_SYSTEM_DRIVER_KEY)
        fsDriver: FileSystemDriver
    ) {
        super(dataDir, fsDriver);
    }
}
