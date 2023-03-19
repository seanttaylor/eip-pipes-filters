import DataPipe from "./interface.js";
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
     * 
     */
    put() {

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