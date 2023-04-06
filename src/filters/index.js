/**
 * Abstraction used for all filters consuming data pipes in the application
 */
export default class PipeFilter {
    static required = (methodName) => {
      throw new Error(`Missing implementation: (${methodName})`);
    };
  
    constructor() {
      if (this.constructor == PipeFilter) {
        throw new Error(`Cannot instantiate abstract class: (PipeFilter)`);
      }
    }
  
    run() {
      PipeFilter.required('run');
    }
  }
  
  export { PipeFilter };