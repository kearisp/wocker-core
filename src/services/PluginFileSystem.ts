import {Inject, Injectable} from "../decorators";
import {PLUGIN_DIR_KEY} from "../env";
import {FileSystem} from "../makes";


@Injectable()
export class PluginFileSystem extends FileSystem {
    public constructor(
        @Inject(PLUGIN_DIR_KEY)
        pluginDir: string
    ) {
        super(pluginDir);
    }
}
