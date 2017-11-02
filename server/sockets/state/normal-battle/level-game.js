import sqldb from '../../../sqldb';
import LevelGameUser from './level-game-user';
import LevelBid from './level-bid';
import {generateRandomString} from '../../../utils/functions';
import url from 'url';
import config from '../../../config/environment';
import {
    EVT_EMIT_UPDATE_NORMAL_BATTLE_LEVEL_PLAYER_LIST,
    EVT_EMIT_NORMAL_BATTLE_LEVEL_TIMER,
    EVT_EMIT_NORMAL_BATTLE_GAME_STARTED,
    EVT_EMIT_NBL_GAME_FINISHED,
    EVT_EMIT_SHOW_NBL_PLACE_BID_BUTTON,
    EVT_EMIT_UPDATE_AVAILABLE_BID_AFTER_BATTLE_WIN,
    EVT_EMIT_UPDATE_NORMAL_BATTLE_JACKPOT_AMOUNT,
    EVT_EMIT_NORMAL_BATTLE_MAIN_JACKPOT_FINISHED,
    EVT_EMIT_UPDATE_HOME_JACKPOT_BATTLE_INFO,
    EVT_EMIT_NORMAL_BATTLE_GAME_IS_ABOUT_TO_START
} from '../../events/battle/constants';

const UserModel     = sqldb.User;
const avatarUrl     = url.format({
    protocol:   config.protocol,
    hostname:   config.ip,
    port:       config.port,
    pathname:   'images/avatar.jpg',
});

function LevelGame(level)
{
    this.level          = level;
    this.duration       = parseInt(level.metaData.duration, 10);
    this.status         = 'NOT_STARTED';
    this.gameId         = generateRandomString(20, 'aA');
    this.users          = [];
    this.bids           = [];
    this.lastBid        = null;
    this.winner         = null;

    this.setRoomName();
}

LevelGame.prototype.isRunning = function()
{

    return this.status == 'STARTED';
}

LevelGame.prototype.isFinished = function()
{

    return this.status == 'FINISHED';
}

LevelGame.prototype.isNotStarted = function()
{

    return this.status == 'NOT_STARTED';
}

LevelGame.prototype.countDown = function()
{
    if(this.duration  > 0)
    {
        this.duration -= 1;
    }
}

LevelGame.prototype.setRoomName = function()
{
    var roomPrefix  = 'JACKPOT_NORMAL_BATTLE_LEVEL_ROOM_';
    var uniqueId    = this.gameId;
    var roomName    = roomPrefix + uniqueId;
    this.roomName   = roomName;
}

LevelGame.prototype.getRoomName = function()
{

    return this.roomName;
}

LevelGame.prototype.getHumanDuration = function()
{
    var time = this.convertSecondsToCounterTime(this.duration);
    return time.minutes + ":" + time.seconds;
}

LevelGame.prototype.hasUser = function(jackpotUser)
{

    return this.getUser(jackpotUser) !== false ? true : false;
}

LevelGame.prototype.getUser = function(jackpotUser)
{
    var levelGameUser;

    for(var k in this.users)
    {
        levelGameUser = this.users[k];

        if(levelGameUser && levelGameUser.jackpotUser.metaData.id == jackpotUser.metaData.id)
        {
            return levelGameUser;
        }
    }

    return false;
}

LevelGame.prototype.addUser = function(jackpotUser)
{
    var userExist   = this.getUser(jackpotUser),
        newUser     = null;

    if(!userExist)
    {
        newUser = new LevelGameUser(this, jackpotUser);
        this.users.push(newUser);
    }

    return this;
}

LevelGame.prototype.startGame = function()
{
    var context = this,
        time    = 10 * 1000,
        i       = 1000,
        countdn = time,
        interval;

    interval = (function(i, time, context)
    {
        return setInterval(function()
        {
            if(i > time)
            {
                context.status = 'STARTED';
                global.jackpotSocketNamespace.in(context.getRoomName()).emit(EVT_EMIT_NORMAL_BATTLE_GAME_STARTED, {status: true});
                global.jackpotSocketNamespace.in(context.getRoomName()).emit(EVT_EMIT_SHOW_NBL_PLACE_BID_BUTTON, {status: true});
                clearInterval(interval);
            }
            else
            {
                global.jackpotSocketNamespace.in(context.getRoomName()).emit(EVT_EMIT_NORMAL_BATTLE_GAME_IS_ABOUT_TO_START, {time: parseInt(countdn/1000, 10)});
                countdn -= 1000;
            }

            i += 1000;

        }, i);

    }(i, time, context));
}

LevelGame.prototype.getAllUsers = function()
{

    return this.users;
}

LevelGame.prototype.getAllActiveUsersInfo = function()
{
    var users = [],
        user;

    if(this.users.length > 0)
    {
        for(var i in this.users)
        {
            user = this.users[i];
            users.push({
                userId:         user.jackpotUser.metaData.id,
                name:           user.jackpotUser.metaData.name,
                totalBids:      user.bids.length,
                remainingBids:  user.availableBids,
                picture:        avatarUrl,
            })
        }
    }

    return users;
}

LevelGame.prototype.getLastBidUser = function()
{

    return this.getLastBid() == null ? null : this.getLastBid().user;
}

LevelGame.prototype.getLongestBidUser = function()
{

    return this.getLongestBid() == null ? null : this.getLongestBid().user;
}

LevelGame.prototype.getLastBid = function()
{

    return this.lastBid;
}

LevelGame.prototype.getAllBids = function()
{

    return this.bids;
}

LevelGame.prototype.getLongestBid = function()
{
    var bids       = this.getAllBids(),
        lastBid    = this.lastBid,
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
      return e.duration > l.duration ? e : l;
    });

    if(lastBid != null && longestBid.duration > lastBid.getRealTimeDuration())
    {
        return longestBid;
    }
    else
    {
        return lastBid;
    }
}

LevelGame.prototype.getLongestBidDuration = function(humanReadable, excludeLast)
{
    if(this.lastBid == null)
    {
        return false;
    }

    var longestBid  = this.getLongestBid(),
        lastBid     = this.lastBid,
        lastBidRTD  = lastBid.getRealTimeDuration(),
        duration,
        time;

    if(longestBid.duration > lastBidRTD)
    {
        duration = longestBid.duration;
    }
    else
    {
        duration = lastBidRTD;
    }

    // If exclude last, then ignore last bid
    if(excludeLast)
    {
        duration = longestBid.duration;
    }

    // Send in human readable
    if(typeof humanReadable != 'undefined' && humanReadable == true)
    {
        time = this.convertSecondsToCounterTime(duration);
        return time.minutes + ':' + time.seconds;
    }

    return duration;
}

LevelGame.prototype.getHumanLastBidDuration = function()
{
    var time = this.getLastBid() != null ? this.convertSecondsToCounterTime(this.getLastBid().getRealTimeDuration()) : null;

    if(time !== null)
    {
        return time.minutes + ":" + time.seconds;
    }

    return null;
}

LevelGame.prototype.getHumanLongestBidDuration = function()
{
    return this.getLongestBidDuration(true);
}

LevelGame.prototype.convertSecondsToCounterTime = function(seconds)
{
    var days                = Math.floor(seconds/24/60/60),
        hoursLeft           = Math.floor((seconds) - (days*86400)),
        hours               = Math.floor(hoursLeft/3600),
        minutesLeft         = Math.floor((hoursLeft) - (hours*3600)),
        minutes             = Math.floor(minutesLeft/60),
        remainingSeconds    = seconds % 60;

    if(hours < 10)
    {
        hours = "0" + hours;
    }

    if(minutes < 10)
    {
        minutes = "0" + minutes;
    }

    if(remainingSeconds < 10)
    {
        remainingSeconds = "0" + remainingSeconds;
    }

    return {
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: remainingSeconds
    };
}

LevelGame.prototype.emitUpdatesToItsRoom = function(excludeSocket)
{
    var roomName = this.getRoomName();

    if(typeof excludeSocket != 'undefined')
    {
        excludeSocket.broadcast.in(roomName).emit(EVT_EMIT_UPDATE_NORMAL_BATTLE_LEVEL_PLAYER_LIST, this.getUpdatedPlayerList());
    }
    else
    {
        global.jackpotSocketNamespace.in(roomName).emit(EVT_EMIT_UPDATE_NORMAL_BATTLE_LEVEL_PLAYER_LIST, this.getUpdatedPlayerList());
    }
}

LevelGame.prototype.updateTimer = function()
{
    if(this.duration == 0 && this.status == 'STARTED')
    {
        this.finishGame();
        return;
    }

    if(this.status == 'STARTED')
    {
        this.countDown();
    }

    var roomName            = this.getRoomName(),
        durationTime        = this.getHumanDuration(),
        lastBidDuration     = this.getHumanLastBidDuration(),
        longestBidDuration  = this.getHumanLongestBidDuration(),
        lastBidUserName     = null,
        longestBidUserName  = null;

    if(this.getLongestBid() || this.getLastBid())
    {
        longestBidUserName = this.getLongestBid() == null ? this.getLastBid().user.jackpotUser.metaData.name : this.getLongestBid().user.jackpotUser.metaData.name;
    }

    if(this.getLastBid() != null)
    {
        lastBidUserName = this.getLastBid().user.jackpotUser.metaData.name;
    }

    // Emit the updated battle timer to everybody in its room
    global.jackpotSocketNamespace.in(roomName).emit(EVT_EMIT_NORMAL_BATTLE_LEVEL_TIMER, {
        battleClock         : durationTime,
        currentBidDuration  : lastBidDuration,
        currentBidUserName  : lastBidUserName,
        longestBidDuration  : longestBidDuration,
        longestBidUserName  : longestBidUserName
    });
}

LevelGame.prototype.finishGame = function()
{
    this.status = 'FINISHED';

    // Declare Winner
    this.declareWinner();

    // Increase winner jackpot bids
    this.updateWinnerJackpotInstance();
}

LevelGame.prototype.placeBid = function(levelGameUser, callback)
{
    if(this.lastBid != null)
    {
        this.lastBid.updateDuration();
    }

    var bid = new LevelBid(levelGameUser);

    // Push this bid into game bids
    this.bids.push(bid);

    // Push this bid into user bids also
    levelGameUser.bids.push(bid);

    // Update last bid
    this.lastBid = bid;

    // Decrease a bid of user
    levelGameUser.decreaseAvailableBids();

    // Increase Game Duration
    this.duration += this.level.metaData.incrementSeconds;

    if(this.duration >= this.level.metaData.duration)
    {
        this.duration = this.level.metaData.duration;
    }

    // Call the callback
    if(typeof callback == 'function')
    {
        callback.call(global, bid, levelGameUser);
    }
}

LevelGame.prototype.getUpdatedPlayerList = function()
{
    var users           = this.getAllUsers(),
        normalizedUsers = [],
        user,
        jackpotUser,
        userBids;

    if(users.length > 0)
    {
        for(var k in users)
        {
            user        = users[k];
            jackpotUser = user.jackpotUser;
            userBids    = user.getAllBids();
            normalizedUsers.push({
                id:         jackpotUser.metaData.id,
                name:       jackpotUser.metaData.name,
                //picture:    jackpotUser.metaData.photo,
                picture:    avatarUrl,
                totalBids:  userBids.length,
                remainingBids: user.availableBids
            })
        }
    }

    return {players: normalizedUsers};
}

LevelGame.prototype.declareWinner = function()
{
    var lastBidUser,
        longestBidUser,
        bothAreSame = false;

    if(this.getLastBid() != null)
    {
        lastBidUser     = this.getLastBid().user;
        longestBidUser  = this.getLongestBid() != null ? this.getLongestBid().user : null;

        if(this.bids.length == 1 || (longestBidUser != null && lastBidUser.jackpotUser.metaData.id == longestBidUser.jackpotUser.metaData.id))
        {
            bothAreSame = true;
        }

        this.winner     = {
            lastBidWinner       : lastBidUser,
            longestBidWinner    : longestBidUser,
            bothAreSame         : bothAreSame
        }
    }
}

LevelGame.prototype.isUserWinner = function(jackpotUser)
{
    var result = false;

    if(this.winner != null)
    {
        if(
            (this.winner.lastBidWinner.jackpotUser.metaData.id == jackpotUser.metaData.id) ||
            (this.winner.longestBidWinner != null && this.winner.longestBidWinner.jackpotUser.metaData.id == jackpotUser.metaData.id)
        )
        {
            result = true;
        }
    }

    return result;
}

LevelGame.prototype.updateWinnerJackpotInstance = function()
{
    var winner                      = this.winner,
        lastBidWinner,
        longestBidWinner,
        lastBidWinnerPercent        = parseInt(this.level.metaData.lastBidWinnerPercent, 10),
        longestBidWinnerPercent     = parseInt(this.level.metaData.lastBidWinnerPercent, 10),
        prizeType                   = this.level.metaData.prizeType,
        prizeValue                  = prizeType == 'BID' ? parseInt(this.level.metaData.prizeValue, 10) : parseFloat(this.level.metaData.prizeValue, 10);

    if(winner != null)
    {
        lastBidWinner       = winner.lastBidWinner;
        longestBidWinner    = winner.longestBidWinner;

        if(prizeType == 'BID' && prizeValue > 0)
        {
            if(winner.bothAreSame == true)
            {
                lastBidWinner.jackpotUser.availableBids += prizeValue;

                lastBidWinner.jackpotUser.totalNormalBattleWins += 1;

                lastBidWinner.jackpotUser.normalBattleStreakArray.push('WINNER');

                // Update Streak Array
                for(var k in this.users)
                {
                    if(this.users[k] && this.users[k].jackpotUser.metaData.id != lastBidWinner.jackpotUser.metaData.id)
                    {
                        this.users[k].jackpotUser.normalBattleStreakArray.push('LOOSER');
                        this.users[k].jackpotUser.currentSocket.emit(EVT_EMIT_UPDATE_HOME_JACKPOT_BATTLE_INFO, {
                            battleWins: this.users[k].jackpotUser.totalNormalBattleWins + this.users[k].jackpotUser.totalGamblingBattleWins,
                            battleStreak: this.users[k].jackpotUser.getNormalBattleCurrentStreak()
                        });
                    }
                }

                // Update the available bid to socket for last bid winner
                lastBidWinner.jackpotUser.currentSocket.emit(EVT_EMIT_UPDATE_AVAILABLE_BID_AFTER_BATTLE_WIN, {
                    availableBids: lastBidWinner.jackpotUser.availableBids
                });

                lastBidWinner.jackpotUser.currentSocket.emit(EVT_EMIT_UPDATE_HOME_JACKPOT_BATTLE_INFO, {
                    battleWins: lastBidWinner.jackpotUser.totalNormalBattleWins + lastBidWinner.jackpotUser.totalGamblingBattleWins,
                    battleStreak: lastBidWinner.jackpotUser.getNormalBattleCurrentStreak()
                });
            }
            else
            {
                lastBidWinner.jackpotUser.availableBids     += parseInt((lastBidWinnerPercent/100 * prizeValue), 10);
                longestBidWinner.jackpotUser.availableBids  += parseInt((longestBidWinnerPercent/100 * prizeValue), 10);

                // Update battle wins
                lastBidWinner.jackpotUser.totalNormalBattleWins     += 1;
                longestBidWinner.jackpotUser.totalNormalBattleWins  += 1;

                lastBidWinner.jackpotUser.normalBattleStreakArray.push('WINNER');
                longestBidWinner.jackpotUser.normalBattleStreakArray.push('WINNER');

                for(var j in this.users)
                {
                    if(this.users[j] &&
                        this.users[j].jackpotUser.metaData.id != lastBidWinner.jackpotUser.metaData.id &&
                        this.users[j].jackpotUser.metaData.id != longestBidWinner.jackpotUser.metaData.id)
                    {
                        this.users[j].jackpotUser.normalBattleStreakArray.push('LOOSER');
                        this.users[k].jackpotUser.currentSocket.emit(EVT_EMIT_UPDATE_HOME_JACKPOT_BATTLE_INFO, {
                            battleWins: this.users[k].jackpotUser.totalNormalBattleWins + this.users[k].jackpotUser.totalGamblingBattleWins,
                            battleStreak: this.users[k].jackpotUser.getNormalBattleCurrentStreak()
                        });
                    }
                }

                // Update the available bid to socket for last bid winner
                lastBidWinner.jackpotUser.currentSocket.emit(EVT_EMIT_UPDATE_AVAILABLE_BID_AFTER_BATTLE_WIN, {
                    availableBids: lastBidWinner.jackpotUser.availableBids
                });

                // Update the available bid to socket for last bid winner
                longestBidWinner.jackpotUser.currentSocket.emit(EVT_EMIT_UPDATE_AVAILABLE_BID_AFTER_BATTLE_WIN, {
                    availableBids: longestBidWinner.jackpotUser.availableBids
                });

                // Update battle info on home screen for last bid user
                lastBidWinner.jackpotUser.currentSocket.emit(EVT_EMIT_UPDATE_HOME_JACKPOT_BATTLE_INFO, {
                    battleWins: lastBidWinner.jackpotUser.totalNormalBattleWins + lastBidWinner.jackpotUser.totalGamblingBattleWins,
                    battleStreak: lastBidWinner.jackpotUser.getNormalBattleCurrentStreak()
                });

                // Update battle info on home screen for longest bid user
                longestBidWinner.jackpotUser.currentSocket.emit(EVT_EMIT_UPDATE_HOME_JACKPOT_BATTLE_INFO, {
                    battleWins: longestBidWinner.jackpotUser.totalNormalBattleWins + longestBidWinner.jackpotUser.totalGamblingBattleWins,
                    battleStreak: longestBidWinner.jackpotUser.getNormalBattleCurrentStreak()
                });
            }
        }
        else if(prizeType == 'MONEY' && prizeValue > 0)
        {

        }

        global.jackpotSocketNamespace.in(this.getRoomName()).emit(EVT_EMIT_NBL_GAME_FINISHED, {
            status:             true,
            lastBidWinner:      {
                id:             lastBidWinner.jackpotUser.metaData.id,
                name:           lastBidWinner.jackpotUser.metaData.name,
                availableBids:  lastBidWinner.jackpotUser.availableBids
            },
            longestBidWinner:   {
                id:             longestBidWinner.jackpotUser.metaData.id,
                name:           longestBidWinner.jackpotUser.metaData.name,
                availableBids:  longestBidWinner.jackpotUser.availableBids
            },
            bothAreSame:        winner.bothAreSame
        });
    }
    else
    {
        global.jackpotSocketNamespace.in(this.getRoomName()).emit(EVT_EMIT_NBL_GAME_FINISHED, {
            status:             true
        });
    }
}

LevelGame.prototype.updateNewJackpotAmount = function(amount)
{
    global.jackpotSocketNamespace.in(this.getRoomName()).emit(EVT_EMIT_UPDATE_NORMAL_BATTLE_JACKPOT_AMOUNT, {amount: amount});
}

LevelGame.prototype.emitMainJackpotFinished = function(amount)
{
    global.jackpotSocketNamespace.in(this.getRoomName()).emit(EVT_EMIT_NORMAL_BATTLE_MAIN_JACKPOT_FINISHED, {status: true});
}

export default LevelGame;