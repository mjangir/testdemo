'use strict';

import { convertSecondsToCounterTime } from '../../../utils/functions';

function Timeclock(data)
{
    this.clockName  = data.clockName;
    this.duration   = data.duration;
    this.remaining  = data.duration;
    this.elapsed    = 0;

    this.everyXSecondsCallbacks = [];
}

Timeclock.prototype.runEveryXSecond = function(second, callback)
{
    this.everyXSecondsCallbacks.push({
        second      : second,
        callback    : callback,
        lastCalled  : 0
    })
}

Timeclock.prototype.increaseBy = function(second)
{
    if(this.remaining + second >= this.duration)
    {
        this.remaining = this.duration;
    }
    else
    {
        this.remaining += second;
    }
}

Timeclock.prototype.countDown = function()
{
    if(this.remaining > 0)
    {
        this.remaining -= 1;
        this.elapsed   = this.duration - this.remaining;
    }

    this.callEveryXSecondCallbacks();
}

Timeclock.prototype.callEveryXSecondCallbacks = function()
{
    var cbItem;

    if(this.everyXSecondsCallbacks.length > 0)
    {
        for(var k in this.everyXSecondsCallbacks)
        {
            cbItem = this.everyXSecondsCallbacks[k];

            if(cbItem.lastCalled + cbItem.second == this.elapsed)
            {
                cbItem.lastCalled = this.elapsed;
                cbItem.callback.call(this, this.elapsed, this.remaining);
            }
        }
    }
}

Timeclock.prototype.getFormattedRemaining = function()
{
    var time    = this.remaining,
        t       = convertSecondsToCounterTime(time),
        str     = t.hours + ':' + t.minutes + ':' + t.seconds;

    if(t.days > 0)
    {
        return t.days + ':' + str;
    }

    return str;
}

export default Timeclock;