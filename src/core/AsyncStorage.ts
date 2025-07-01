import {AsyncLocalStorage} from "node:async_hooks";
import type {Container} from "./Container";


export const AsyncStorage = new AsyncLocalStorage<Container>();
