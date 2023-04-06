import PipeFilter from "../index.js";

class AuthzPipeFilter extends PipeFilter {
  #dataPipe;

  /**
   * 
   * @param {DataPipe} dataPipe
   */
  constructor(dataPipe) {
    super();
    this.#dataPipe = dataPipe;
  }

  /**
   * The core logic of the filter; executes client-specified logic when an incoming message arrives on the data pipe
   * @param {Function} filterFn 
   */
  run(filterFn) {
    this.#dataPipe.open();
    this.#dataPipe.onPull({ topic: "decrypt-authz", onMessage: ({ message }) => {
      const destringifiedMessage = JSON.parse(JSON.parse(message.value.toString()));
      filterFn(destringifiedMessage, this.#dataPipe);
      }
    });
  }
}

  
export {
  AuthzPipeFilter
}