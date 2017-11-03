'use strict';

import Timeclock from './timeclock';

function TimeclockContainer(game)
{
    this.game   = game;
    this.clocks = {};
}

TimeclockContainer.prototype.setClocks = function(data)
{
    var times = [];

    if(!Array.isArray(data) && typeof data == 'object')
    {
        times.push(data);
    }
    else
    {
        times = data;
    }

    this.times = data;

    for(var k in times)
    {
        this.clocks[times[k].clockName] = new Timeclock(times[k]);
    }
}

TimeclockContainer.prototype.countDown = function()
{
    for(var k in this.clocks)
    {
        this.clocks[k].countDown();
    }
}

TimeclockContainer.prototype.getClock = function(name)
{
    return this.clocks[name] || false;
}

export default TimeclockContainer;