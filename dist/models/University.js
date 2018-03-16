"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var University =
/**
 * Todo constructor
 * @param  {String}  name      Text that describes the task to do
 * //@param  {Boolean} [done=false] True if the task is done
 */
function University(name) {
  _classCallCheck(this, University);

  this.id = ++University.counter;
  this.name = name;
  //this.done = done;
};

// counter of instances


University.counter = 0;

module.exports = University;