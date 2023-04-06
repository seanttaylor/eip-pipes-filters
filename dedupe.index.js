import { promisify } from "util";
import cache from "memory-cache";
import figlet from "figlet";

import { DedupePipeFilter } from "./src/filters/dedupe/index.js";
import { KafkaDataPipe } from "./src/pipes/kafka.js";

const APP_NAME = process.env.APP_NAME || "dedupe_filter";
const APP_VERSION = process.env.APP_VERSION || "0.0.1";
const GROUP_ID = process.env.KAFKA_GROUP_ID || "gelato_group";
const KAFKA_BOOTSTRAP_SERVER = process.env.KAFKA_BOOTSTRAP_SERVER;
const CLIENT_ID = process.env.KAFKA_CLIENT_ID || "gelato";

const figletize = promisify(figlet);
const banner = await figletize(`${APP_NAME} v${APP_VERSION}`);
console.log(banner);

/********* MAIN **********/
const kafkaDP = new KafkaDataPipe({ 
    BOOTSTRAP_SERVER: KAFKA_BOOTSTRAP_SERVER, 
    CLIENT_ID, 
    GROUP_ID 
});

/*************************/

/**
 * Dedupes duplicate messages where appropriate; forwards message to the commit pipeline for saving to the datastore
 * @param {Object} message - message from Kafka broker
 * @param {KafkaDataPipe} dataPipe - the data pipe the message was delivered on
 */
function onDedupe(message, dataPipe) {
    console.log(message.header.eventId);
    if (!cache.get(`${message.header.eventId}`)) {
        cache.put(`${message.header.eventId}`, new Date().toISOString());
        
        dataPipe.put({
            topic: "dedupe-commit",
            message: JSON.stringify(message)
        });
    }
}

const ddpFilter = new DedupePipeFilter(kafkaDP);
ddpFilter.run(onDedupe);