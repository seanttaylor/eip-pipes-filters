import { promisify } from "util";
import figlet from "figlet";
import { IceCreamService, IceCreamServiceClient } from "./src/filters/root/index.js";
import { Message, MessageHeader, MessageBody } from "./src/filters/root/message.js";
import { KafkaDataPipe } from "./src/pipes/kafka.js";

const APP_NAME = process.env.APP_NAME || "ice_cream_pipeline";
const APP_VERSION = process.env.APP_VERSION || "0.0.1";
const GROUP_ID = process.env.KAFKA_GROUP_ID || "default-group";
const KAFKA_BOOTSTRAP_SERVER = process.env.KAFKA_BOOTSTRAP_SERVER;
const CLIENT_ID = process.env.KAFKA_CLIENT_ID;

const figletize = promisify(figlet);
const banner = await figletize(`${APP_NAME} v${APP_VERSION}`);
console.log(banner);

/********* MAIN **********/
const kafkaDP = new KafkaDataPipe({ 
    BOOTSTRAP_SERVER: KAFKA_BOOTSTRAP_SERVER, 
    CLIENT_ID, 
    GROUP_ID 
});

/**
 * @typedef {Object} Observer
 */
const kafkaDPObserver = {
    complete() {
        console.info("Processing completed.");
    },
    error(e) {
        console.error(`Processing halted. There was an error. ${e}`);
    },
    next(message) {
        //console.log(message);
        const myMessage = new Message(
            new MessageHeader({
                id: message.id,
                eventType: "create",
                eventName: "create.ice_cream"
            }),
            new MessageBody(message)
        );
        
        //console.log(myMessage.value());
        
        kafkaDP.put({ 
            topic: "ingress", 
            message: myMessage.value()
        });
    }
};

const sherbertClient = new IceCreamServiceClient(kafkaDP, kafkaDPObserver);
const sherbert = new IceCreamService(sherbertClient);

console.log(kafkaDP);

/*************************/



