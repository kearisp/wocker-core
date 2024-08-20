import {Injectable} from "../decorators";


@Injectable("PROXY_SERVICE")
export abstract class ProxyService {
    public abstract start(): Promise<void>;
}
