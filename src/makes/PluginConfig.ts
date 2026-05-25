import {FileSystem} from "./FileSystem";


export abstract class PluginConfig {
    public constructor(_data: any) {}

    public save(): void {
        throw new Error("Method not implemented");
    }

    public toObject(): any {
        throw new Error("Method not implemented");
    }

    public static make<C extends typeof PluginConfig>(fs: FileSystem, configPath = "config.json"): InstanceType<C> {
        const data = fs.exists(configPath)
            ? fs.readJSON(configPath)
            : {};

        return new class extends this {
            public constructor(data: any) {
                super(data);
            }

            public save(): void {
                if(!fs.exists()) {
                    fs.mkdir("", {
                        recursive: true
                    });
                }

                fs.writeJSON(configPath, this.toObject());
            }
        }(data) as InstanceType<C>;
    }
}
