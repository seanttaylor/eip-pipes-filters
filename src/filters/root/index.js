import { Observable } from "rxjs";
import messages from "./items.js";

/**
 *  The RxJS observer interface For more info see: https://rxjs.dev/guide/observer
 * @typedef {Object} Observer
 * @property {Function} complete - executed when the associated observable no longer has values to emit
 * @property {Function} error - executed when the associated observable produces an error
 * @property {Function} next - executed when the associated observable emits a value
 */

class IceCreamServiceClient {
    #dataPipe;
    #observer;

    /**
     * @param {Object} dataPipe - an interface for a generic data source that can be pushed to or pulled from
     * @param {Observer} observer - a client-defined observer API for processing incoming messages
     */
    constructor(dataPipe, observer) {
        this.#dataPipe = dataPipe;
        this.#observer = observer;
    }

    /**
     * Initializes a connection to a specified pipe for futher processing by a downstream filter
     */
    init() {
        try {
            this.#dataPipe.open();
        } catch(e) {
            console.error(e);
        }
    }

    /**
     * Returns an RxJS Observer API for observable subscriptions
     * @return {Observer}
     */
    getMessageAPI() {
        return this.#observer;
    }
}

/**
 * Pushes ice cream metadata to a specified client for further processing
 */
class IceCreamService {
    #client;

    /**
     * @param {IceCreamServiceClient} client - object revealing an API for subscribing to messages from the IceCreamService   
     */
    constructor(client) {
        if (!client) {
            throw new Error("IceCreamServiceClient: Missing client");
        }

        try {
            this.#client = client;
            this.#client.init();
            
            let idx = 0;
            const iceCream$ = new Observable((subscriber) => {
                setInterval(()=> {
                    if (!messages.items[idx]) {
                        return;
                    }

                    if (idx % 2 === 0) {
                        subscriber.next(messages.items[idx]);
                    } else {
                        subscriber.next(messages.items[idx]);
                        subscriber.next(messages.items[idx]);
                        subscriber.next(messages.items[idx]);
                    }

                    idx === messages.items.length ? idx = 0 : idx++;
                }, 1000);
            }).subscribe(this.#client.getMessageAPI());

        } catch(e) {
            throw new Error(`IceCreamService -> There was an error (${e})`);
        }
    }
}


export {
    IceCreamService,
    IceCreamServiceClient
};
