import figlet from "figlet";
import { promisify } from "util";
import { decrypt } from "./src/shared/encryption.js";

import { DecryptPipeFilter } from "./src/filters/decrypt/index.js";
import { KafkaDataPipe } from "./src/pipes/kafka.js";

const APP_NAME = process.env.APP_NAME || "decrypt_filter";
const APP_VERSION = process.env.APP_VERSION || "0.0.1";
const GROUP_ID = process.env.KAFKA_GROUP_ID || "softserve_group";
const KAFKA_BOOTSTRAP_SERVER = process.env.KAFKA_BOOTSTRAP_SERVER;
const CLIENT_ID = process.env.KAFKA_CLIENT_ID || "softserve";

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
 * Decrypts incoming messages from the "ingress" pipe
 * @param {Object} message - message from Kafka broker
 * @param {KafkaDataPipe} dataPipe - the data pipe the message was delivered on
 */
function onDecrypt(message, dataPipe) {
    const decryptedMessage = decrypt(message);
    
    dataPipe.put({
        topic: "decrypt-authz",
        message: JSON.stringify(decryptedMessage)
    });
}


const dpFilter = new DecryptPipeFilter(kafkaDP);
dpFilter.run(onDecrypt);










