import { promisify } from "util";
import { AccessControl } from "accesscontrol";
import figlet from "figlet";

import { AuthzFilter } from "./src/filters/authorize/index.js";
import { KafkaDataPipe } from "./src/pipes/kafka.js";
import { grants, roles } from "./src/shared/authorization.js";

const APP_NAME = process.env.APP_NAME || "authz_filter";
const APP_VERSION = process.env.APP_VERSION || "0.0.1";
const GROUP_ID = process.env.KAFKA_GROUP_ID || "froyo_group";
const KAFKA_BOOTSTRAP_SERVER = process.env.KAFKA_BOOTSTRAP_SERVER;
const CLIENT_ID = process.env.KAFKA_CLIENT_ID || "froyo";

const ac = new AccessControl(grants);
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
 * Validates the sender of the message is authorized to send specified messages to the system
 * @param {Object} message - message from Kafka broker
 * @param {KafkaDataPipe} dataPipe - the data pipe the message was delivered on
 */
function onAuthz(message, dataPipe) {
    const { role, userId } = message.payload;

    //unsupported role type
    if (!roles[role]) {
        console.error(`Unsupported role type: (${role})`);
        return;
    }

    // user does not have the specified role
    if (!roles[role].includes(userId)) {
        console.error(`Unauthorized: (${userId})`);
        return;
    }

    // user does not have the authorization grants required
    const permission = ac.can(role).createAny("ice_cream");

    if (!permission.granted) {
        console.error("Unauthorized: missing required grant (create:any) for ice_cream resource");
        return;
    }

    dataPipe.put({
        topic: "authz-dedupe",
        message: JSON.stringify(message)
    });
}
const authzFilter = new AuthzFilter(kafkaDP);
authzFilter.run(onAuthz);
