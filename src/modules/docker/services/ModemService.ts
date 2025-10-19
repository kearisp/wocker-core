import type Modem from "docker-modem";
import {Injectable} from "../../../decorators";


@Injectable("DOCKER_MODEM_SERVICE")
export abstract class ModemService {
    public abstract get modem(): Modem;
}
