'use strict';

import moment from 'moment';

/**
 * Constructor
 *
 * @param {Integer} userId
 * @return {*}
 */
function Bid(userId)
{
	this.userId 	= userId;
	this.startTime 	= new Date();
	this.endTime 	= null;
	this.duration 	= null;
}

/**
 * Update duration of this bid by getting difference
 *
 * @return {Integer}
 */
Bid.prototype.getDuration = function()
{
	return this.duration == null ? this.getRealTimeDuration() : this.duration;
}

/**
 * Get Real Time Duration
 *
 * @return {Integer}
 */
Bid.prototype.getRealTimeDuration = function()
{
	return moment(new Date()).diff(moment(this.startTime), "seconds");
}

/**
 * Update duration of this bid by getting difference
 *
 * @return {*}
 */
Bid.prototype.updateDuration = function()
{
	this.endTime 	= new Date();
	this.duration 	= moment(this.endTime).diff(moment(this.startTime), "seconds");
}

export default Bid;