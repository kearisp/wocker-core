import {AppConfig, AppConfigProperties} from "./AppConfig";

export type ConfigProperties = AppConfigProperties;

/* istanbul ignore next */
/**
 * @deprecated
 * @see AppConfig
 */
export abstract class Config extends AppConfig {
    protected constructor(data: ConfigProperties) {
        super(data);
    }
}
