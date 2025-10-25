import {AsyncLocalStorage} from "node:async_hooks";
import type {Container} from "./Container";


export const AsyncStorage = new class extends AsyncLocalStorage<Container> {
    public getContainer(): Container {
        const container = AsyncStorage.getStore();

        if(!container) {
            throw new Error("Couldn't find container");
        }

        return container;
    }
}();
