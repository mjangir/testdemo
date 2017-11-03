'use strict';

function TimeClock(game)
{

}

TimeClock.prototype.setInitialData = function(data)
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
        this.setTimeObject(times[k]);
    }
}

TimeClock.prototype.setTimeObject = function(time)
{
    this[time.durationKey]      = time.initialTime;
    this[time.remainingKey]     = time.initialTime;
}

TimeClock.prototype.countDown = function()
{
    for(var k in this.times)
    {
        if(this[this.times[k].remainingKey] > 0)
        {
            this[this.times[k].remainingKey] -= 1;
        }
    }
}

export default TimeClock;