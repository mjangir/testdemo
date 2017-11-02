'use strict';

import sqldb from '../../../sqldb';
import Jackpot from './jackpot';

const JackpotModel = sqldb.Jackpot;

/**
 * Constructor
 *
 * @param {Function} callback
 */
function JackpotState(callback)
{
    this.callback = callback;
    this.jackpots = {};

    this.init();
}

/**
 * Init the state
 *
 * @return {Mixed}
 */
JackpotState.prototype.init = function()
{
    var context = this;

    JackpotModel.findAll({raw : true}).then(function(jackpots)
    {
        if(jackpots.length > 0)
        {
            for(var i = 0; i < jackpots.length; i++)
            {
                context.addJackpot(jackpots[i]);
            }

            if(typeof context.callback == 'function')
            {
                context.callback.call(global);
            }
        }
        else
        {
            context.callback.call(global);
        }
    }).catch(function(error)
    {
        return false;
    });
}

/**
 * Get all jackpots
 *
 * @return {Object}
 */
JackpotState.prototype.getJackpots = function()
{
    return this.jackpots;
}

/**
 * Add a new jackpot to state
 *
 * @param {Object} data
 * @return {*}
 */
JackpotState.prototype.addJackpot = function(data)
{
    var uniqueId = data.uniqueId;

    if(!uniqueId)
    {
        return;
    }

    if(this.jackpots.hasOwnProperty(uniqueId))
    {
        return this.jackpots[uniqueId];
    }

    this.jackpots[uniqueId] = new Jackpot(data);
}

/**
 * Update Jackpot Data
 *
 * @param  {String} uniqueId [description]
 * @param  {Object} data
 * @return {JackpotState}
 */
JackpotState.prototype.updateJackpot = function(uniqueId, data)
{
    if(!this.jackpots[uniqueId])
    {
        return;
    }

    var jackpot = this.jackpots[uniqueId];

    jackpot.updateData(data);

    return this;
}

/**
 * Remove Jackpot by unique id
 *
 * @param  {String} uniqueId
 * @return {JackpotState}
 */
JackpotState.prototype.removeJackpot = function(uniqueId)
{
    if(!this.jackpots[uniqueId])
    {
        return;
    }

    delete this.jackpots[uniqueId];

    return this;
}

/**
 * Get Jackpot Of A User
 *
 * @param  {Integer} userId
 * @return {Boolean|JackpotUser}
 */
JackpotState.prototype.getUserJackpot = function(userId)
{
    var jackpots    = this.jackpots,
        uniqueIds   = Object.keys(jackpots),
        length      = uniqueIds.length,
        uniqueId,
        jackpot;

    if(length)
    {
        for(var i = 0; i < length; i++)
        {
            uniqueId    = uniqueIds[i];
            jackpot     = jackpots[uniqueId];

            if(jackpot.hasUser(userId))
            {
                return jackpot;
            }
        }
    }

    return false;
}

/**
 * Pick a new jackpot for user
 *
 * @return {Jackpot}
 */
JackpotState.prototype.pickupNewJackpot = function()
{
    var jackpots    = this.jackpots,
        uniqueIds   = Object.keys(jackpots),
        length      = uniqueIds.length,
        uniqueId,
        jackpot,
        foundJackpot,
        metaData;

    if(length > 0)
    {
        for(var i = 0; i < length; i++)
        {
            uniqueId    = uniqueIds[i];
            jackpot     = jackpots[uniqueId];
            metaData    = jackpot.getMetaData();

            if(metaData.gameStatus == 'STARTED' && metaData.doomsDayRemaining > 0)
            {
                foundJackpot = jackpot;
            }
        }

        if(typeof foundJackpot == 'undefined')
        {
            for(var i = 0; i < length; i++)
            {
                uniqueId    = uniqueIds[i];
                jackpot     = jackpots[uniqueId];
                metaData    = jackpot.getMetaData();

                if(metaData.gameStatus == 'NOT_STARTED')
                {
                    foundJackpot = jackpot;
                    break;
                }
            }
        }

        if(typeof foundJackpot != 'undefined')
        {
            return foundJackpot;
        }
    }

    return false;
}

/**
 * Check if state has Jackpot by unique ID
 *
 * @param  {String}  uniqueId
 * @return {Boolean}
 */
JackpotState.prototype.hasJackpot = function(uniqueId)
{
    return this.jackpots.hasOwnProperty(uniqueId);
}

/**
 * Get jackpot by unique ID
 *
 * @param  {String} uniqueId
 * @return {Jackpot}
 */
JackpotState.prototype.getJackpot = function(uniqueId)
{
    return this.jackpots[uniqueId];
}

// Export JackpotState
export default JackpotState;