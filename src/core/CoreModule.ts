import {Cli} from "@kearisp/cli";
import {Global, Module} from "../decorators";
import {
    AppService,
    AppConfigService,
    AppFileSystemService,
    ProcessService,
    EventService,
    LogService,
    ProjectRepository
} from "../services";
import {
    WOCKER_VERSION_KEY,
    WOCKER_VERSION,
    WOCKER_DATA_DIR_KEY,
    WOCKER_DATA_DIR,
    FILE_SYSTEM_DRIVER_KEY
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
            useValue: WOCKER_DATA_DIR
        },
        AppService,
        AppConfigService,
        AppFileSystemService,
        ProjectRepository,
        ProcessService,
        EventService,
        LogService
    ],
    exports: [
        Cli,
        WOCKER_VERSION_KEY,
        WOCKER_DATA_DIR_KEY,
        FILE_SYSTEM_DRIVER_KEY,
        AppService,
        AppConfigService,
        AppFileSystemService,
        ProjectRepository,
        ProcessService,
        EventService,
        LogService
    ]
})
export class CoreModule {}
