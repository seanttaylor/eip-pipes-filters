import crypto from "crytpo";

/**
 * Constructs a valid message header for the ice cream pipeline
 */
class MessageHeader {
    #eventId;
    #payloadId;
    #eventType;
    #eventName;
    #next = null;
    #schemaURL = null;
    #createdTimestamp = new Date().toISOString();

    /**
     * 
     * @param {String} id 
     * @param {String} eventType
     * @param {String} eventName
     * @param {String} next
     * @param {String} schemaURL
     */
    constructor({ id, eventType, eventName, next=null, schemaURL=null }) {
        if (!id || !eventType || !eventName) {
            throw new Error("Cannot create message header");
        }

        this.#eventId = crypto.randomUUID();
        this.#eventType = eventType;
        this.#eventName = eventName;
        this.#payloadId = id;
        this.#schemaURL = schemaURL;
        this.#next = next;
    }

    value() {
        return {
            eventId: this.#eventId,
            eventType: [
              this.#eventType
            ],
            eventName: [
                this.#eventName
            ],
            createdTimestamp: this.#createdTimestamp,
            rel: {
                id: this.#payloadId,
                schemaURL: this.#schemaURL,
                next: this.#next
            }
        };
    }
}


/**
 * Constructs a valid message body for the ice cream pipeline
 */
class MessageBody {
    #eventType;
    #content;

    constructor({ eventType, content }) {
        // We could validate the payload here
        this.#eventType = eventType;
        this.#content = content;
    }

    value() {
        return {
            eventType: this.#eventType,
            content: this.#content
        }
    }
}

/**
 * Builds and validates a message for ingestion into the pipeline
 */
class Message {
    #messageHeader
    #messageBody

    /**
     * 
     * @param {MessageHeader} header 
     * @param {MessageBody} body 
     */
    constructor({ header, body }) {
        // Or we could validate the payload here...
        this.#messageHeader = header.value();
        this.#messageBody = body.value();
    }

    value() {
        return {
            header: this.#messageHeader,
            payload: this.#messageBody
        }
    }
}

export default {
    Message,
    MessageHeader,
    MessageBody
}