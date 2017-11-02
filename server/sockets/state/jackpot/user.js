'use strict';

import Bid from './bid';
import moment from 'moment';
import _ from 'lodash';

/**
 * Constructor
 *
 * @param {Object} data
 */
function User(data)
{
	var defAvailableBids = 10;

	if(global.globalSettings['jackpot_setting_default_bid_per_user_per_game'])
    {
        defAvailableBids = parseInt(global.globalSettings['jackpot_setting_default_bid_per_user_per_game'], 10);
    }

	this.metaData 					= data;
	this.gameStatus 				= 'JOINED';
	this.isActive 					= true;
	this.availableBids 				= defAvailableBids;
	this.placedBids 				= [];
	this.lastBid 					= null;
	this.firstBidStartTime 			= null;
	this.lastBidStartTime 			= null;
	this.currentSocket 				= null;
	this.totalNormalBattleWins 		= 0;
	this.totalGamblingBattleWins 	= 0;
	this.normalBattleStreakArray 	= [];
	this.gamblingBattleStreakArray 	= [];
}

/**
 * Place a new bid
 *
 * @return {Bid}
 */
User.prototype.placeNewBid = function()
{
	var bid = new Bid(this);

	this.placedBids.push(bid);

	// Set last bid
	this.lastBid = bid;

	// Decrease available bid count
	this.availableBids -= 1;

	if(this.firstBidStartTime == null)
	{
		this.firstBidStartTime = new Date();
	}

	this.lastBidStartTime = new Date();

	return bid;
}

/**
 * Get user meta data
 *
 * @return {Object}
 */
User.prototype.getMetaData = function()
{
	return this.metaData;
}

/**
 * Get my longest bid
 *
 * @return {Bid}
 */
User.prototype.getMyLongestBid = function()
{
	var bids = this.getMyBids(),
        longest;

    if(bids.length <= 0)
    {
    	return null;
    }
    else if(bids.length == 1)
    {
    	return bids[0];
    }

	longest = bids.reduce(function(l, e)
    {
      return e.duration > l.duration ? e : l;
    });

    return longest;
}

/**
 * Get my longest bid duration
 * TODO - implement human readable flag
 *
 * @param  {Boolean} humanReadable
 * @return {Integer}
 */
User.prototype.getMyLongestBidDuration = function(humanReadable)
{
	var longestBid 	= this.getMyLongestBid(),
		duration 	= null;

	// If user placed no bid
	if(longestBid == null)
	{
		return null;
	}

	// If his longest bid duration is null, then this is currently leading bid
	if(longestBid.duration == null)
	{
		duration = longestBid.getRealTimeDuration();
	}
	else
	{
		duration = longestBid.duration;
	}

	return duration;
}

/**
 * Get My Bids
 *
 * @param {Boolean} raw
 * @return {Array}
 */
User.prototype.getMyBids = function(raw)
{
	var bids = [];

	if(typeof raw == 'undefined')
	{
		return this.placedBids;
	}

	if(typeof raw != 'undefined' && raw == true)
	{
		for(var i = 0; i < this.placedBids.length; i++)
		{
			bids.push({
				startTime: moment(this.placedBids[i].startTime).format("YYYY-MM-DD HH:mm:ss"),
				endTime : this.placedBids[i].endTime != null ? moment(this.placedBids[i].endTime).format("YYYY-MM-DD HH:mm:ss") : null,
				duration: this.placedBids[i].duration
			})
		}

		return bids;
	}

	return [];
}

User.prototype.getNormalBattleTotalWins = function()
{
	return this.normalBattleStreakArray.reduce(function(n, val)
	{
	    return n + (val === 'WINNER');
	}, 0);
}

User.prototype.getGamblingBattleTotalWins = function()
{
	return this.gamblingBattleStreakArray.reduce(function(n, val)
	{
	    return n + (val === 'WINNER');
	}, 0);
}

User.prototype.getNormalBattleTotalLosses = function()
{
	return this.normalBattleStreakArray.reduce(function(n, val)
	{
	    return n + (val === 'LOOSER');
	}, 0);
}

User.prototype.getGamblingBattleTotalLosses = function()
{
	return this.gamblingBattleStreakArray.reduce(function(n, val)
	{
	    return n + (val === 'LOOSER');
	}, 0);
}

User.prototype.getNormalBattleCurrentStreak = function()
{
	var input = this.normalBattleStreakArray;
	return this.getBattleCurrentStreak(input);
}

User.prototype.getGamblingBattleCurrentStreak = function()
{
	var input = this.gamblingBattleStreakArray;
	return this.getBattleCurrentStreak(input);
}

User.prototype.getNormalBattleLongestStreak = function()
{
	var input = this.normalBattleStreakArray;
	return this.getBattleLongestStreak(input);
}

User.prototype.getGamblingBattleLongestStreak = function()
{
	var input = this.gamblingBattleStreakArray;
	return this.getBattleLongestStreak(input);
}

User.prototype.getBattleCurrentStreak = function(input)
{
	var winnerData 	= this.getBattleStreakData(input);

	if(input.length == 0 || input[input.length - 1] == 'LOOSER')
	{
		return 0;
	}

	if(winnerData.length == 0)
	{
		return 0;
	}

	return winnerData[winnerData.length - 1]['times'];
}

User.prototype.getBattleLongestStreak = function(input)
{
	var winnerData 	= this.getBattleStreakData(input);

	if(input.length == 0 || input[input.length - 1] == 'LOOSER')
	{
		return 0;
	}

	if(winnerData.length == 0)
	{
		return 0;
	}

	return _.max(winnerData.map(function(a){
		return a.times;
	}));
}

User.prototype.getBattleStreakData = function(input)
{
	var output 		= [],
		winnerData 	= [];

	for (var i=0; i<input.length; i++)
	{
	    if (!output[output.length-1] || output[output.length-1].value != input[i])
	    {
	    	output.push({value: input[i], times: 1})
	    }
	    else
	    {
	    	output[output.length-1].times++;
	    }
	}

	winnerData = _.filter(output, {value: 'WINNER'});

	return winnerData;
}

// Export User
export default User;