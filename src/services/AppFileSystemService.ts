import {Injectable, Inject} from "../decorators";
import {FileSystem} from "../makes/FileSystem";
import {WOCKER_DATA_DIR_KEY} from "../env";


@Injectable()
export class AppFileSystemService extends FileSystem {
    public constructor(
        @Inject(WOCKER_DATA_DIR_KEY)
        dataDir: string
    ) {
        super(dataDir);
    }
}
