import {Config, ConfigProperties} from "./Config";


interface Constructible<P extends ConfigProperties, C extends Config<P>> {
    new (props: P): C;
}


export class ConfigCollection<C extends Config<P>, P extends ConfigProperties> {
    public items: C[]

    public constructor(
        protected ConfigClass: Constructible<P, C>,
        items: P[]
    ) {
        this.items = items.map((props: P): C => {
            return new this.ConfigClass(props);
        });
    }

    public setConfig(config: C): void {
        let exists = false;

        for(let i = 0; i < this.items.length; i++) {
            if(this.items[i].name === config.name) {
                exists = true;
                this.items[i] = config;
            }
        }

        if(!exists) {
            this.items.push(config);
        }
    }

    public getConfig(name: string): C | undefined {
        return this.items.find((config: C) => {
            return config.name === name;
        });
    }

    public removeConfig(name: string): void {
        const index = this.items.findIndex((storage) => {
            return storage.name === name;
        });

        if(index === -1) {
            return;
        }

        this.items = [
            ...this.items.slice(0, index),
            ...this.items.slice(index + 1)
        ];
    }

    public toArray(): P[] {
        return this.items.map((item: C): P => {
            return item.toObject();
        });
    }
}
