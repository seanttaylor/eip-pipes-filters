import { decrypt } from "../../shared/encryption.js";

class DecryptFilter {
  #dataPipe;

  /**
   * 
   * @param {DataPipe} dataPipe
   */
  constructor(dataPipe) {
    this.#dataPipe = dataPipe;
  }

  /**
   * 
   * @param {Function} filterFn 
   */
  run(filterFn) {
    this.#dataPipe.onPull({ 
      topic: "ingress", 
      onMessage(msg) {
        // decrypt `msg` here 
        // filterFn(`msg`);
      }
    });
  }

}

/**
 * 
 */
function onDecrypt(message, dataPipe) {
    
}

const decryptFilter = new DecryptFilter(kafkaDP);
decryptFilter.run(onDecrypt);
