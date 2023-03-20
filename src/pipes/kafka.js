import DataPipe from "./interface.js";
import crypto from "crypto";
import { Kafka } from "kafkajs";

class KafkaDataPipe extends DataPipe {
    #config;
    #consumer;
    #producer;
    
    /**
     * 
     */
    constructor(config) {
        super(config);
        this.#config = config;
    }
    
    /**
     * Sends a message to the stream
     * @param {String} topic - topic to put the message on
     * @param {Object} message - message to add to the stream
     */
    async put({ topic, message }) {
        this.#producer.send({
          topic,
          messages: [ { key: crypto.randomUUID(), value: JSON.stringify(message) }],
        });
    }

    /**
     * 
     */
    pull() {

    }

    /**
     * 
     */
    async open() {
        const kafka = new Kafka({
            clientId: this.#config.CLIENT_ID,
            brokers: [`${this.#config.BOOTSTRAP_SERVER}`],
        });
  
        this.#consumer = kafka.consumer({ groupId: this.#config.GROUP_ID });
        this.#producer = kafka.producer();
  
        if (!this.#config.as) {
            // default setting; stream will both produce *AND* consume messages
            await this.#consumer.connect();
            await this.#producer.connect();
            return;
        }
      
        if (this.#config.as === "producer") {
            await this.#producer.connect();
            return;
        }
      
        if (this.#config.as === "consumer") {
            this.#consumer.connect();
            return;
        }
    }
}

export { KafkaDataPipe };