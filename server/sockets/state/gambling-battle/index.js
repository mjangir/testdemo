import sqldb from '../../../sqldb';
import Level from './level';

const JackpotBattleLevel = sqldb.JackpotBattleLevel;

/**
 * Constructor
 * @param {Jackpot}
 */
function Container(jackpot)
{
    this.jackpot    = jackpot;
    this.levels     = {};

    //Init
    this.init();
}

/**
 * Init the state
 *
 * @return {Mixed}
 */
Container.prototype.init = function()
{
    var context = this;

    JackpotBattleLevel.findAll({
        raw : true,
        where: {
            battleType: 'GAMBLING',
            jackpotId: context.jackpot.metaData.id
        }
    }).then(function(levels)
    {
        if(levels.length > 0)
        {
            for(var i = 0; i < levels.length; i++)
            {
                var level = levels[i],
                    order = parseInt(level.order, 10);

                context.levels[order] = new Level(context, level);
            }

            if(typeof context.callback == 'function')
            {
                context.callback.call(global);
            }
        }
    }).catch(function(error)
    {
        return false;
    });
}

Container.prototype.getLevelByUniqueId = function(levelUniqueId)
{
    var levels = this.levels,
        level;

    if(levels.length <= 0)
    {
        return false;
    }

    for(var k in levels)
    {
        level = levels[k];

        if(level.uniqueId == levelUniqueId)
        {
            return level;
        }
    }

    return false;
}

Container.prototype.getRunningGameByUser = function(jackpotUser)
{
    var levels = this.levels,
        level;

    if(Object.keys(levels).length > 0)
    {
        for(var k in levels)
        {
            if(levels.hasOwnProperty(k))
            {
                level = levels[k];
                if(level.getRunningGameByUser(jackpotUser) !== false)
                {
                    return level.getRunningGameByUser(jackpotUser);
                }
            }
        }
    }

    return false;
}

Container.prototype.getRunningGameByUserAndLevel = function(jackpotUser, levelUniqueId)
{
    var level = this.getLevelByUniqueId(levelUniqueId);
    return (!level) ? false : level.getRunningGameByUser(jackpotUser);
}

Container.prototype.getNewGameByUserAndLevel = function(jackpotUser, levelUniqueId, gamblingBids)
{
    var level = this.getLevelByUniqueId(levelUniqueId);
    return (!level) ? false : level.getNewGameByUser(jackpotUser, gamblingBids);
}

Container.prototype.getBattleLevelListByUser = function(jackpotUser)
{
    var returnLevels    = [],
        result          = [],
        levels          = this.levels,
        levelOrders     = Object.keys(levels),
        order,
        nextOrder,
        level,
        minWinsRequired,
        metaData;

    if(levelOrders.length > 0)
    {
        for(var i in levelOrders)
        {
            order           = parseInt(levelOrders[i], 10);
            nextOrder       = String(order + 1);
            level           = levels[order];
            returnLevels.push(level);
        }
    }

    if(returnLevels.length > 0)
    {
        for(var j in returnLevels)
        {
            if(returnLevels[j])
            {
                var thisLevel   = returnLevels[j],
                    metaData    = thisLevel.metaData;

                result.push({
                    uniqueId                : thisLevel.uniqueId,
                    order                   : metaData.order,
                    levelName               : metaData.levelName,
                    prizeType               : metaData.prizeType,
                    prizeValue              : metaData.prizeValue,
                    minBidsToGamb           : metaData.minBidsToGamb,
                    defaultAvailableBids    : metaData.defaultAvailableBids,
                    isLastLevel             : metaData.isLastLevel
                });
            }
        }
    }

    return result;
}

Container.prototype.updateTimer = function()
{
    var levels = this.levels,
        level;

    if(Object.keys(levels).length > 0)
    {
        for(var k in levels)
        {
            if(levels.hasOwnProperty(k))
            {
                level = levels[k];
                level.updateTimer();
            }
        }
    }
}

Container.prototype.updateNewJackpotAmount = function(amount)
{
    var levels = this.levels,
        level;

    if(Object.keys(levels).length > 0)
    {
        for(var k in levels)
        {
            if(levels.hasOwnProperty(k))
            {
                level = levels[k];
                level.updateNewJackpotAmount(amount);
            }
        }
    }
}

Container.prototype.emitMainJackpotFinished = function()
{
    var levels = this.levels,
        level;

    if(Object.keys(levels).length > 0)
    {
        for(var k in levels)
        {
            if(levels.hasOwnProperty(k))
            {
                level = levels[k];
                level.emitMainJackpotFinished();
            }
        }
    }
}

// Export Jackpot
export default Container;