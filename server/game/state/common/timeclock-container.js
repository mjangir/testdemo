import Timeclock from './timeclock';

/**
 * Timeclock Container
 * 
 * @param {any} game 
 */
function TimeclockContainer(game) {
    this.game   = game;
    this.clocks = {};
}

/**
 * Set Clock
 * 
 * @param {Array|Object} data
 * @returns {*}
 */
TimeclockContainer.prototype.setClocks = function(data) {
    var times = [];

    if(!Array.isArray(data) && typeof data == 'object') {
        times.push(data);
    } else {
        times = data;
    }

    this.times = data;

    for(var k in times) {
        this.clocks[times[k].clockName] = new Timeclock(times[k]);
    }
}

/**
 * Count Down Clock
 * 
 * @returns {*}
 */
TimeclockContainer.prototype.countDown = function() {
    for(var k in this.clocks) {
        this.clocks[k].countDown();
    }
}

/**
 * Get Clock By Name And Time
 * 
 * @param {String} name
 * @param {Integer} time
 * @returns {*}
 */
TimeclockContainer.prototype.getClock = function(name, time) {
  this.clocks[name] = new Timeclock({
    clockName: name,
    duration: time
  });
}

/**
 * Get Clock By Name
 * 
 * @returns {Timeclock|Boolean}
 */
TimeclockContainer.prototype.getClock = function(name) {
    return this.clocks[name] || false;
}

export default TimeclockContainer;
