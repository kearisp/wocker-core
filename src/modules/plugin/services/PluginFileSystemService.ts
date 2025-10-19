import {Inject, Injectable} from "../../../decorators";
import {FileSystem} from "../../../makes";
import {FileSystemDriver} from "../../../types";
import {PLUGIN_DIR_KEY, FILE_SYSTEM_DRIVER_KEY} from "../../../env";


@Injectable()
export class PluginFileSystemService extends FileSystem {
    public constructor(
        @Inject(PLUGIN_DIR_KEY)
        pluginDir: string,
        @Inject(FILE_SYSTEM_DRIVER_KEY)
        driver: FileSystemDriver
    ) {
        super(pluginDir, driver);
    }
}
