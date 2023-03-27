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
   * The core logic of the filter; executes client-specified logic when an incoming message arrives on the data pipe
   * @param {Function} filterFn 
   */
  run(filterFn) {
    this.#dataPipe.open();
    this.#dataPipe.onPull({ topic: "ingress", onMessage: ({ message }) => {
        filterFn(JSON.parse(message.value.toString()), this.#dataPipe);
      }
    });
  }

}

export {
  DecryptFilter
}

