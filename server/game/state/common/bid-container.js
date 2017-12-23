import Bid from './bid';
import { getUserObjectById, convertSecondsToCounterTime } from '../../../utils/functions';
import _ from 'lodash';

/**
 * Constructor
 *
 * @return {*}
 */
function BidContainer(parent) {
	this.parent = parent;
	this.bids 	= [];
}

/**
 * Place a new Bid
 *
 * @return {Bid}
 */
BidContainer.prototype.placeBid = function(userId, socket, callback) {
	var bid 	= new Bid(userId),
		lastBid = this.getLastBid();

	if(lastBid != null) {
		lastBid.updateDuration();
	}

	this.bids.push(bid);

	if(typeof callback == 'function') {
		callback.call(this, this, this.parent, socket, bid);
	} else {
		return bid;
	}
}

BidContainer.prototype.getAllBids = function(userId) {
	if(typeof userId != 'undefined') {
		return _.filter(this.bids, function(o) { 
		    return o.userId == userId; 
		});
	}

	return this.bids;
}

/**
 * Get longest Bid
 *
 * @return {Bid|null}
 */
BidContainer.prototype.getLongestBid = function(userId) {
	var bids       = typeof userId != 'undefined' ? this.getAllBids(userId) : this.bids,
        longestBid;

    if(!Array.isArray(bids)) {
    	return null;
    }

    if(bids.length <= 0) {
        return null;
    } else if(bids.length == 1) {
        return bids[0];
    }

    longestBid = _.max(bids, function(object) {
      return object.getDuration();
    });

    return longestBid;
}

/**
 * Get longest bid duration
 *
 * @return {Integer|null}
 */
BidContainer.prototype.getLongestBidDuration = function(formatted) {
	var longestBid 	= this.getLongestBid(),
		duration 	= longestBid != null ? longestBid.getDuration() : null;

	if(typeof formatted != 'undefined' && formatted == true && duration != null) {
		return this.formattedClockTime(duration);
	}

	return duration;
}

/**
 * Get longest bid user name
 *
 * @return {String|null}
 */
BidContainer.prototype.getLongestBidUser = function() {
	var longestBid = this.getLongestBid();

	return longestBid == null ? null : getUserObjectById(longestBid.userId);
}

/**
 * Get longest bid user name
 *
 * @return {String|null}
 */
BidContainer.prototype.getLongestBidUserName = function() {
	var user = this.getLongestBidUser();

	return user == null ? null : user.name;
}

/**
 * Get longest bid user id
 *
 * @return {Integer|null}
 */
BidContainer.prototype.getLongestBidUserId = function() {
	var longestBid = this.getLongestBid();

	return longestBid == null ? null : longestBid.userId;
}

/**
 * Get last Bid
 *
 * @return {Bid|null}
 */
BidContainer.prototype.getLastBid = function() {
	return this.bids.length > 0 ? this.bids[this.bids.length - 1] : null;
}

/**
 * Get last bid duration
 *
 * @return {Integer|null}
 */
BidContainer.prototype.getLastBidDuration = function(formatted) {
	var lastBid 	= this.getLastBid(),
		duration 	= lastBid != null ? lastBid.getDuration() : null;

	if(typeof formatted != 'undefined' && formatted == true && duration != null) {
		return this.formattedClockTime(duration);
	}

	return duration;
}

/**
 * Get last bid user name
 *
 * @return {String|null}
 */
BidContainer.prototype.getLastBidUser = function() {
	var lastBid = this.getLastBid();

	return lastBid == null ? null : getUserObjectById(lastBid.userId);
}

/**
 * Get last bid user name
 *
 * @return {String|null}
 */
BidContainer.prototype.getLastBidUserName = function() {
	var user = this.getLastBidUser();

	return user == null ? null : user.name;
}

/**
 * Get last bid user id
 *
 * @return {Integer|null}
 */
BidContainer.prototype.getLastBidUserId = function() {
	var lastBid = this.getLastBid();

	return lastBid == null ? null : lastBid.userId;
}

/**
 * Is longest and last bid user name are same?
 *
 * @return {Boolean}
 */
BidContainer.prototype.isLongestAndLastBidUserSame = function() {
	return this.getLastBidUserId() == this.getLongestBidUserId();
}

/**
 * Get Total Bids Count By User ID
 * 
 * @param Integer userId
 * @returns Integer
 */
BidContainer.prototype.getTotalBidsCountByUserId = function(userId) {
	var allUserBids 	= this.getAllBids(userId),
		totalBidCount 	= Array.isArray(allUserBids) ? allUserBids.length : 0;
	return totalBidCount;
}

/**
 * Get Longest Bid Duration By User ID
 * 
 * @param Integer userId
 * @param Boolean formatted
 * @returns {*}
 */
BidContainer.prototype.getLongestBidDurationByUserId = function(userId, formatted) {
	var longestBid 	= this.getLongestBid(userId),
		duration 	= longestBid != null ? longestBid.getDuration() : null;

	if(typeof formatted != 'undefined' && formatted == true && duration != null) {
		return this.formattedClockTime(duration);
	}

	return duration;
}

/**
 * Get Formatted Clock Time
 * 
 * @param Integer time
 * @returns String
 */
BidContainer.prototype.formattedClockTime = function(time) {
	var t 	= convertSecondsToCounterTime(time),
		str = t.hours + ':' + t.minutes + ':' + t.seconds;

	if(t.days > 0) {
		return t.days + ':' + str;
	}

	return str;
}

export default BidContainer;
