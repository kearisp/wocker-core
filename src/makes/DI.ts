import "reflect-metadata";


class DI {
    private services: Map<any, any> = new Map();

    resolveService<T>(key: any): T {
        let res = this.services.get(key);

        if(!res) {
            const types = Reflect.getMetadata("design:paramtypes", key);
            const params = types ? types.map((type: any) => {
                return this.resolveService(type);
            }) : [];

            res = new key(this);

            this.services.set(key, res);
        }

        return res;
    }

    registerService(key: any, service: any) {
        this.services.set(key, service);
    }

    use() {

    }
}


export {DI}
