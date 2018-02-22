import { convertSecondsToCounterTime } from '../../../utils/functions';

/**
 * Timeclock Constructor
 * 
 * @param {any} data 
 */
function Timeclock(data) {
    this.clockName      = data.clockName;
    this.duration       = data.duration;
    this.remaining      = data.duration;
    this.remainingOnce  = data.duration;
    this.elapsed        = 0;

    this.everyXSecondsCallbacks = [];
}

/**
 * Run Every X Second
 * 
 * @param Integer second
 * @param Function callback
 * @returns {*}
 */
Timeclock.prototype.runEveryXSecond = function(second, callback) {
    this.everyXSecondsCallbacks.push({
        second      : second,
        callback    : callback,
        lastCalled  : 0
    })
}

/**
 * Increase Clock By X Seconds
 * 
 * @param Integer second
 * @returns {*}
 */
Timeclock.prototype.increaseBy = function(second) {
    if(this.remaining + second >= this.duration) {
        this.remaining = this.duration;
    } else {
        this.remaining += second;
    }
}

/**
 * Count Down Clock
 * 
 * @returns {*}
 */
Timeclock.prototype.countDown = function() {
    if(this.remaining > 0) {
        this.remaining      -= 1;
        this.remainingOnce  -= 1;
        this.elapsed        = this.duration - this.remainingOnce;
    }

    this.callEveryXSecondCallbacks();
}

/**
 * Call Every X Second Callbacks
 * 
 * @returns {*}
 */
Timeclock.prototype.callEveryXSecondCallbacks = function() {
    var cbItem;

    if(this.everyXSecondsCallbacks.length > 0) {
        for(var k in this.everyXSecondsCallbacks) {
            cbItem = this.everyXSecondsCallbacks[k];

            if(cbItem.lastCalled + cbItem.second == this.elapsed) {
                cbItem.lastCalled = this.elapsed;
                cbItem.callback.call(this, this.elapsed, this.remainingOnce);
            }
        }
    }
}

/**
 * Get Formatted Remaining Time
 * 
 * @returns String
 */
Timeclock.prototype.getFormattedRemaining = function() {
    var time    = this.remaining,
        t       = convertSecondsToCounterTime(time),
        str     = t.hours + ':' + t.minutes + ':' + t.seconds;

    if(t.days > 0) {
        return t.days + ':' + str;
    }

    return str;
}

export default Timeclock;
