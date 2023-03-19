import { Observable } from "rxjs";

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

            const sampleMessage = {
                header: {
                  "eventId": "16421f41-de6f-4a90-b462-efb5a13eb174",
                  "eventType": [
                    "create"
                  ],
                  "eventName": [
                      "create.ice_cream"
                  ],
                  "createdTimestamp": "2022-05-30T08:49:46.745Z",
                  "detectionTimestamp": "2022-05-30T08:49:46.745Z",
                  "rel": {
                      "id": "205bdec2-036e-4e59-b930-34db01576434",
                      "schemaVersion": "/schemas/ice_cream/messages/create/0.0.1",
                      "next": "https://mylambdas.some.url-123456789"
                  }
                },
                payload: {
                  "name": "Vanilla Toffee Bar Crunch",
                  "image_closed": "/files/live/sites/systemsite/files/flavors/products/us/pint/open-closed-pints/vanilla-toffee-landing.png",
                  "image_open": "/files/live/sites/systemsite/files/flavors/products/us/pint/open-closed-pints/vanilla-toffee-landing-open.png",
                  "description": "Vanilla Ice Cream with Fudge-Covered Toffee Pieces",
                  "story": "Vanilla What Bar Crunch? We gave this flavor a new name to go with the new toffee bars we’re using as part of our commitment to source Fairtrade Certified and non-GMO ingredients. We love it and know you will too!",
                  "sourcing_values": [
                    "Non-GMO",
                    "Cage-Free Eggs",
                    "Fairtrade",
                    "Responsibly Sourced Packaging",
                    "Caring Dairy"
                  ],
                  "ingredients": [
                    "cream",
                    "skim milk",
                    "liquid sugar (sugar",
                    "water)",
                    "water",
                    "sugar",
                    "coconut oil",
                    "egg yolks",
                    "butter (cream",
                    "salt)",
                    "vanilla extract",
                    "almonds",
                    "cocoa (processed with alkali)",
                    "milk",
                    "soy lecithin",
                    "cocoa",
                    "natural flavor",
                    "salt",
                    "vegetable oil (canola",
                    "safflower",
                    "and/or sunflower oil)",
                    "guar gum",
                    "carrageenan"
                  ],
                  "allergy_info": "may contain wheat, peanuts and other tree nuts",
                  "dietary_certifications": "Kosher",
                  "productId": "646"
                }
            };
        
            const iceCream$ = new Observable((subscriber) => {
                const myInterval = setInterval(()=> subscriber.next(sampleMessage), 1000);
            }).subscribe(this.#client.getMessageAPI());

        } catch(e) {
            throw new Error(`IceCreamService: There was an error (${e})`);
        }
    }
}


export {
    IceCreamService,
    IceCreamServiceClient
};
