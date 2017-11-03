'use strict';

import Bid from './bid';
import { getUserObjectById } from '../../../utils/functions';

/**
 * Constructor
 *
 * @return {*}
 */
function BidContainer()
{
	this.bids = [];
}

/**
 * Place a new Bid
 *
 * @return {Bid}
 */
BidContainer.prototype.placeBid = function(userId)
{
	var bid 	= new Bid(userId),
		lastBid = this.getLastBid();

	lastBid.updateDuration();

	this.bids.push(bid);

	return bid;
}

/**
 * Get longest Bid
 *
 * @return {Bid|null}
 */
BidContainer.prototype.getLongestBid = function()
{
	var bids       = this.bids,
        longestBid;

    if(bids.length <= 0)
    {
        return null;
    }
    else if(bids.length == 1)
    {
        return bids[0];
    }

    longestBid = bids.reduce(function(l, e)
    {
      return e.getDuration() > l.getDuration ? e : l;
    });

    return longestBid;
}

/**
 * Get longest bid duration
 *
 * @return {Integer|null}
 */
BidContainer.prototype.getLongestBidDuration = function()
{
	var longestBid = this.getLongestBid();

	return longestBid != null ? longestBid.getDuration() : null;
}

/**
 * Get longest bid user name
 *
 * @return {String|null}
 */
BidContainer.prototype.getLongestBidUserName = function()
{
	var longestBid = this.getLongestBid();

	return longestBid == null ? null : getUserObjectById(longestBid.userId);
}

/**
 * Get longest bid user id
 *
 * @return {Integer|null}
 */
BidContainer.prototype.getLongestBidUserName = function()
{
	var longestBid = this.getLongestBid();

	return longestBid == null ? null : longestBid.userId;
}

/**
 * Get last Bid
 *
 * @return {Bid|null}
 */
BidContainer.prototype.getLastBid = function()
{
	return this.bids.length > 0 ? this.bids[this.bids.length - 1] : null;
}

/**
 * Get last bid duration
 *
 * @return {Integer|null}
 */
BidContainer.prototype.getLastBidDuration = function()
{
	var lastBid = this.getLastBid();

	return lastBid != null ? lastBid.getDuration() : null;
}

/**
 * Get last bid user name
 *
 * @return {String|null}
 */
BidContainer.prototype.getLastBidUserName = function()
{
	var lastBid = this.getLastBid();

	return lastBid == null ? null : getUserObjectById(lastBid.userId);
}

/**
 * Get last bid user id
 *
 * @return {Integer|null}
 */
BidContainer.prototype.getLastBidUserId = function()
{
	var lastBid = this.getLastBid();

	return lastBid == null ? null : lastBid.userId;
}

/**
 * Is longest and last bid user name are same?
 *
 * @return {Boolean}
 */
BidContainer.prototype.isLongestAndLastBidUserSame = function()
{
	return this.getLastBidUserId() == this.getLongestBidUserId();
}

export default BidContainer;