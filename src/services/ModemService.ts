import type Modem from "docker-modem";
import {Injectable} from "../decorators";


@Injectable("MODEM_SERVICE")
export abstract class ModemService {
    public abstract get modem(): Modem;
}
