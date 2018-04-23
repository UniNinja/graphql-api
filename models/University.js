class University {
  /**
   * Todo constructor
   * @param  {String}  name      Text that describes the task to do
   * //@param  {Boolean} [done=false] True if the task is done
   */
  constructor (name) {
    this.id = ++University.counter
    this.name = name
    // this.done = done;
  }
}

// counter of instances
University.counter = 0

module.exports = University
