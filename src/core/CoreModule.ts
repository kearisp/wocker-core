import {Cli} from "@kearisp/cli";
import {
    Global,
    Module
} from "../decorators";
import {AppService} from "../services/AppService";
import {AppConfigService} from "../services/AppConfigService";
import {AppFileSystemService} from "../services/AppFileSystemService";
import {ProcessService} from "../services/ProcessService";
import {EventService} from "../services/EventService";
import {LogService} from "../services/LogService";
import {
    WOCKER_VERSION_KEY,
    WOCKER_VERSION,
    WOCKER_DATA_DIR_KEY,
    DATA_DIR
} from "../env";


@Global()
@Module({
    providers: [
        Cli,
        {
            provide: WOCKER_VERSION_KEY,
            useValue: WOCKER_VERSION
        },
        {
            provide: WOCKER_DATA_DIR_KEY,
            useValue: DATA_DIR
        },
        AppService,
        AppConfigService,
        AppFileSystemService,
        ProcessService,
        EventService,
        LogService
    ],
    exports: [
        Cli,
        WOCKER_VERSION_KEY,
        WOCKER_DATA_DIR_KEY,
        AppService,
        AppConfigService,
        AppFileSystemService,
        ProcessService,
        EventService,
        LogService
    ]
})
export class CoreModule {}
