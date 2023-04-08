
import { SQSClient, SendMessageCommand, ReceiveMessageCommand } from '@aws-sdk/client-sqs';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { Observable } from 'rxjs';

const REGION = process.env.AWS_REGION; 
const DEFAULT_SEND_MESSAGE_CONFIG = {
  DelaySeconds: 10,
  QueueUrl: null, 
  MessageBody: null,
};
const DEFAULT_RECEIVE_MESSAGE_CONFIG =  {
  AttributeNames: ["SentTimestamp"],
  MaxNumberOfMessages: 10,
  MessageAttributeNames: ["All"],
  QueueUrl: null,
  VisibilityTimeout: 20,
  WaitTimeSeconds: 0,
};
const mySQSClient = new SQSClient({ 
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  endpoint: process.env.AWS_ENDPOINT_URL, 
  region: REGION 
});
const mySSMClient = new SSMClient({ 
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  endpoint: process.env.AWS_ENDPOINT_URL, 
  region: REGION 
});
const messageQueue$ = new Observable(MessageQueue);


/**
 * Launches an RxJS Observable that polls for data from and AWS SQS queue
 * @returns {Function} An unsubscribed function handled by RxJS to close subscriptions to Observables
 */
function MessageQueue(subscriber) {
    const interval = setInterval(async()=> {
      try {
        const messageBatch = await mySQSClient.send(new ReceiveMessageCommand(DEFAULT_RECEIVE_MESSAGE_CONFIG));
        subscriber.next(messageBatch);
      } catch(e) {
        subscriber.error(e.message);
      }
    }, 1500);
  
    return function unsubscribe() {
      clearInterval(interval);
      subscriber.complete();
    }
}

/**
 * Creates an Observer with the RxJS Observer interface
 * @param {Function} onNextFn - the next method of the returned Observer
 * @returns {Observer}
 */
function ObservableMessageQueueClient(onNextFn) {

    function error(e) {
      console.error(e.message);
    }
  
    function complete() {
      console.log('ObservableMessageQueueClient.unsubscribed');
    }
  
    return {
      next: onNextFn,
      error,
      complete,
    }
}

class SQSPipe extends DataPipe {
    #config;
    static #queues = {
        hello_world: '/dev/platform/sqs/hello_world'
    };
    
    /**
     * 
     */
    constructor(config) {
        super(config);
        this.#config = config;
    }
    
    /**
     * Sends a message to the stream
     * @param {Object} message - message to add to the stream
     */
    async put({ topic, message }) {
        try {
            const messageParams = Object.assign(DEFAULT_SEND_MESSAGE_CONFIG, {
              MessageBody: JSON.stringify(message),
              QueueUrl: this.#config.QUEUE_URL
            });
            const { MessageId } = await mySQSClient.send(new SendMessageCommand(messageParams));
            return MessageId; 
          } catch (e) {
            console.error('SQSPipeError.InternalError.CannotSendMessage =>', e.message)
        }
    }

    /**
     * 
     * @param {Function} onMessage - a callback function to execute on receipt of new messages 
     */
    async onPull({ topic, onMessage }) {
        if (typeof (onMessage) !== 'function') {
            throw Error(`SQSPipeError.BadRequest => onMessage must be of type function, not (${typeof onMessage})`);
        }
        messageQueue$.subscribe(ObservableMessageQueueClient(onMessage));
    }

    /**
     * 
     */
    async open() {
        const SSM_PARAM_NAME = SQSPipe.#queues[this.#config.QUEUE_ID];
        const { Parameter: { Value } } = await mySSMClient.send(new GetParameterCommand({
            Name: SSM_PARAM_NAME,
            WithDecryption: true
        }));

        this.#config.QUEUE_URL = Value;
    }
}

export { SQSPipe };