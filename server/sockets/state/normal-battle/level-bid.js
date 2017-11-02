import sqldb from '../../../sqldb';
import moment from 'moment';
import {generateRandomString} from '../../../utils/functions';

/**
 * Constructor
 * @param {Container}
 * @param {data}
 */
function LevelBid(levelGameUser)
{
    this.user 		= levelGameUser;
    this.startTime 	= new Date();
    this.endTime 	= null;
    this.duration 	= null;
    this.id         = generateRandomString(20, 'aA');
}

/**
 * Update duration of this bid by getting difference
 *
 * @return {*}
 */
LevelBid.prototype.updateDuration = function()
{
	this.endTime 	= new Date();
	this.duration 	= moment(this.endTime).diff(moment(this.startTime), "seconds");
}

/**
 * Get Real time duration of bid
 * difference of start and current time
 *
 * @return {Integer}
 */
LevelBid.prototype.getRealTimeDuration = function()
{
	return moment(new Date()).diff(moment(this.startTime), "seconds");
}

export default LevelBid;