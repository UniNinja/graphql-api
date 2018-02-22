class Universities {
  /**
  * Universities constructor
  * @param {String} name Text that describes the task to do
  */
  constructor(name) {
    this.id = ++Universities.counter;
    this.name = name;
    //this.done = false;
  }
}
// counter of instances
Universities.counter = 0;
module.exports = Universities;
