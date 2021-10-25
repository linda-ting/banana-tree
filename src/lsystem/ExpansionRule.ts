export default class ExpansionRule {
  precondition: string;
  postcondition: string;

  constructor(pre: string, post: string) {
    this.precondition = pre;
    this.postcondition = post;
  }

  expand() {
    // TODO add randomness here! there can be multiple postconditions
    return this.postcondition;
  }
}