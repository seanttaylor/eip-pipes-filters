import { promisify } from "util";
import { MongoClient, ServerApiVersion } from "mongodb";
import figlet from "figlet";

import { CommitFilter, CommitPipeFilter } from "./src/filters/commit/index.js";
import { KafkaDataPipe } from "./src/pipes/kafka.js";

const APP_NAME = process.env.APP_NAME || "commit_filter";
const APP_VERSION = process.env.APP_VERSION || "0.0.1";
const GROUP_ID = process.env.KAFKA_GROUP_ID || "custard_group";
const KAFKA_BOOTSTRAP_SERVER = process.env.KAFKA_BOOTSTRAP_SERVER;
const CLIENT_ID = process.env.KAFKA_CLIENT_ID || "custard";

const figletize = promisify(figlet);
const banner = await figletize(`${APP_NAME} v${APP_VERSION}`);
console.log(banner);

/********* MAIN **********/
const kafkaDP = new KafkaDataPipe({ 
    BOOTSTRAP_SERVER: KAFKA_BOOTSTRAP_SERVER, 
    CLIENT_ID, 
    GROUP_ID 
});

const CONNECTION_URI = process.env.ME_CONFIG_MONGODB_URL;
const client = new MongoClient(CONNECTION_URI,  {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
const connectedClient = await MongoDBClientWrapper(client);


/*************************/

/**
 * 
 */
async function MongoDBClientWrapper(client) {
    try {
        await client.connect();
        await client.db("sorbet").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
        
        return client.db("sorbet");
    } catch(e) {
        console.error(e);
    }
}

/**
 *
 * @param {Object} message - message from Kafka broker
 */
async function onDatabaseCommit(message) {
   const { id: _id, ...messageBody } = message.payload;
   try {
    connectedClient.collection("ice_creams").insertOne({ _id, ...messageBody });
   } catch(e) {
      console.error(e);
   }

}

const commitFilter = new CommitFilter(kafkaDP);
commitFilter.run(onDatabaseCommit);

//const cpFilter = new CommitPipeFilter(kafkaDP);
//cpFilter.run(onDatabaseCommit);
