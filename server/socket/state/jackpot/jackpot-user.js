'use strict';

import {
    EVT_EMIT_NO_ENOUGH_BIDS,
	EVT_EMIT_JACKPOT_CAN_I_BID,
	EVT_EMIT_JACKPOT_GAME_JOINED,
	EVT_EMIT_JACKPOT_BID_PLACED,
    EVT_EMIT_JACKPOT_GAME_QUITTED,

	EVT_EMIT_NORMAL_BATTLE_JOINED,
	EVT_EMIT_NORMAL_BATTLE_SHOW_PLACE_BID,
	EVT_EMIT_NORMAL_BATTLE_HIDE_PLACE_BID,
    EVT_EMIT_NORMAL_BATTLE_BID_PLACED,
    EVT_EMIT_NORMAL_BATTLE_SHOW_QUIT_BUTTON,
    EVT_EMIT_NORMAL_BATTLE_GAME_QUITTED,

    EVT_EMIT_ADVANCE_BATTLE_JOINED,
    EVT_EMIT_ADVANCE_BATTLE_SHOW_PLACE_BID,
    EVT_EMIT_ADVANCE_BATTLE_HIDE_PLACE_BID,
    EVT_EMIT_ADVANCE_BATTLE_BID_PLACED,
    EVT_EMIT_ADVANCE_BATTLE_SHOW_QUIT_BUTTON,
    EVT_EMIT_ADVANCE_BATTLE_GAME_QUITTED
} from '../../constants';

import {
	convertAmountToCommaString,
	getUserObjectById
} from '../../../utils/functions';

import Jackpot from './jackpot';
import NormalBattleLGame from '../normal-battle/normal-battle-game';
import AdvanceBattleLGame from '../advance-battle/advance-battle-game';
import _ from 'lodash';

function JackpotUser(jackpot, userId)
{
	this.userId 				= userId;
	this.jackpot 				= jackpot;
	this.joinedOn 				= new Date();
	this.isActive 				= true;
	this.userGameStatus 		= 'PLAYING';

	this.availableBids = {
		'jackpot' 		: 0,
		'normalBattle' 	: {},
		'advanceBattle' : {}
	};

	this.placedBids = {
		'jackpot' 		: [],
		'normalBattle' 	: {},
		'advanceBattle' : {}
	};

	this.battleWins = {
		'normalBattle' 	: [],
		'advanceBattle' : []
	};
}

JackpotUser.prototype.isQuitted = function()
{
	return this.userGameStatus == 'QUITTED';
}

JackpotUser.prototype.markAsInactive = function()
{
	var context = this;

	this.isActive = false;

	return new Promise(function(resolve, reject)
	{
		resolve(context.jackpot);
	});
}

JackpotUser.prototype.getNormalBattleTotalWinnings = function(level)
{
	var allWins 	= this.battleWins['normalBattle'],
		uniqueId 	= level.uniqueId,
		levelWins 	= _.filter(allWins, function(o)
		{
		    return o.levelUniqueId == uniqueId;
		});

	return levelWins.length;
}


/**
 * The below are only the method which will be called after joining
 * a bid battle or jackpot
 */

/**
 * After joining the jackpot
 *
 * @return {*}
 */
JackpotUser.prototype.afterJoinJackpot = function()
{
    var socket          = this.currentSocket,
        jackpot         = this.jackpot,
        users           = jackpot.users,
        minPlayers      = jackpot.minPlayersRequired,
        userInfo        = getUserObjectById(this.userId),
        bidContainer    = this.jackpot.bidContainer,
        bidsByUser      = bidContainer.getAllBids(this.userId),
        lastBidUserId   = bidContainer.getLastBidUserId(),
        room            = this.jackpot.getRoomName(),
        namespace       = global.ticktockGameState.jackpotSocketNs;

    // Emit Me Joined
    socket.emit(EVT_EMIT_JACKPOT_GAME_JOINED, {
        jackpotInfo:    {
            uniqueId:    jackpot.uniqueId,
            name:        jackpot.title,
            amount:      convertAmountToCommaString(jackpot.jackpotAmount)
        },
        userInfo: {
            name:               userInfo.name,
            availableBids:      this.availableBids['jackpot'],
            totalPlacedBids:    bidsByUser.length,
        }
    });

    // Emit Can I Bid
    if(users.length < minPlayers)
    {
        namespace.in(room).emit(EVT_EMIT_JACKPOT_CAN_I_BID, {canIBid: false});
    }
    else
    {
        socket.emit(EVT_EMIT_JACKPOT_CAN_I_BID, {
            canIBid: (lastBidUserId != this.userId)
        });
    }

    jackpot.emitUpdatesToItsRoom();
}


JackpotUser.prototype.afterJoinBattle = function(socket, level, game)
{
    var evtJoined,
        evtShowBidBtn,
        evtHideBidBtn,
        evtShowQuitBtn,
        gameNotStarted,
        lastBidUserId,
        availableBids,
        totalPlacedBids;

    if(level.constructor.name == 'NormalBattleLevel')
    {
        evtJoined       = EVT_EMIT_NORMAL_BATTLE_JOINED;
        evtShowBidBtn   = EVT_EMIT_NORMAL_BATTLE_SHOW_PLACE_BID;
        evtHideBidBtn   = EVT_EMIT_NORMAL_BATTLE_HIDE_PLACE_BID;
        evtShowQuitBtn  = EVT_EMIT_NORMAL_BATTLE_SHOW_QUIT_BUTTON;
        availableBids   = this.getNormalBattleAvailableBids(level, game);
        totalPlacedBids = this.getNormalBattlePlacedBids(level, game).length;
    }
    else if(level.constructor.name == 'AdvanceBattleLevel')
    {
        evtJoined       = EVT_EMIT_ADVANCE_BATTLE_JOINED;
        evtShowBidBtn   = EVT_EMIT_ADVANCE_BATTLE_SHOW_PLACE_BID;
        evtHideBidBtn   = EVT_EMIT_ADVANCE_BATTLE_HIDE_PLACE_BID;
        evtShowQuitBtn  = EVT_EMIT_ADVANCE_BATTLE_SHOW_QUIT_BUTTON;
        availableBids   = this.getAdvanceBattleAvailableBids(level, game);
        totalPlacedBids = this.getAdvanceBattlePlacedBids(level, game).length;
    }

    // Emit Joined Event
    socket.emit(evtJoined, {
        jackpotInfo:    this.jackpot.getBasicInfo(),
        levelInfo:      level.getBasicInfo(),
        myInfo: {
            userId          : this.userId,
            name            : getUserObjectById(this.userId).name,
            availableBids   : availableBids,
            totalPlacedBids : totalPlacedBids
        },
        gameInfo: {
            duration : game.getClock('game').getFormattedRemaining(),
            uniqueId : game.uniqueId
        },
        players             : game.getAllPlayersList(),
        currentBidDuration  : game.bidContainer.getLastBidDuration(true),
        currentBidUser      : game.bidContainer.getLastBidUserName(),
        longestBidDuration  : game.bidContainer.getLongestBidDuration(true),
        longestBidUser      : game.bidContainer.getLongestBidUserName()
    });

    // Now start the game
    game.startGame();

    // Show hide place bid button
    gameNotStarted  = game.isNotStarted(),
    lastBidUserId   = game.bidContainer.getLastBidUserId();

    if(gameNotStarted || (lastBidUserId != null && lastBidUserId == this.userId))
    {
        socket.emit(evtHideBidBtn);
    }
    else
    {
        socket.emit(evtShowBidBtn);
    }

    // Show Quit Button
    if(game.isNotStarted())
    {
        socket.emit(evtShowQuitBtn, {status: true});
    }

    // Emit updates to game room
    game.emitUpdatesToItsRoom(socket);
}


/**
 * All Quit Jackpot, Normal Battle, Advance Battle Game related
 * function here
 */

JackpotUser.prototype.quitJackpotGame = function(socket)
{
    this.userGameStatus = 'QUITTED';

    socket.emit(EVT_EMIT_JACKPOT_GAME_QUITTED, {status: true});

    this.jackpot.emitUpdatesToItsRoom();
}

JackpotUser.prototype.quitNormalBattleGame = function(socket, level, game)
{
    var removed = game.removeUser(this);

    if(removed)
    {
        socket.emit(EVT_EMIT_NORMAL_BATTLE_GAME_QUITTED);

        game.emitUpdatesToItsRoom(socket);
    }
}

JackpotUser.prototype.quitAdvanceBattleGame = function(socket, level, game)
{
    var removed = game.removeUser(this);

    if(removed)
    {
        socket.emit(EVT_EMIT_ADVANCE_BATTLE_GAME_QUITTED);

        game.emitUpdatesToItsRoom(socket);
    }
}


/**
 * The below are only Bid Related function to get anytime jackpot,
 * normal battle and advance battle available bids, placed bids as
 * well as set default available bids and placed bids. Also increase
 * or decrease the available and placed bids for all of them
 */


JackpotUser.prototype.setJackpotAvailableBids = function(bids)
{
    this.availableBids['jackpot'] = bids;
}

JackpotUser.prototype.setNormalBattleAvailableBids = function(level, game, bids)
{
    this.availableBids['normalBattle'][level.uniqueId][game.uniqueId] = bids;
}

JackpotUser.prototype.setAdvanceBattleAvailableBids = function(level, game, bids)
{
    this.availableBids['advanceBattle'][level.uniqueId][game.uniqueId] = bids;
}

JackpotUser.prototype.setDefaultJackpotAvailableBids = function()
{
    var key         = 'jackpot_setting_default_bid_per_user_per_game',
        settings    = global.ticktockGameState.settings,
        defaultBid  = (settings.hasOwnProperty(key) && settings[key] != "") ? parseInt(settings[key], 10) : 10;

    this.availableBids['jackpot'] = defaultBid;
}

JackpotUser.prototype.setDefaultBattleAvailableBids = function(battleGame)
{
    var level = battleGame.level;

    if(battleGame instanceof NormalBattleLGame)
    {
        this.setDefaultBattleTypeAvailableBids(level, battleGame, 'normalBattle');
    }
    else if(battleGame instanceof AdvanceBattleLGame)
    {
        this.setDefaultBattleTypeAvailableBids(level, battleGame, 'advanceBattle');
    }
}

JackpotUser.prototype.setDefaultBattleTypeAvailableBids = function(level, game, type)
{
    var availableBids = this.availableBids[type];

    if(!availableBids.hasOwnProperty(level.uniqueId))
    {
        availableBids[level.uniqueId] = {};
    }
    if(!availableBids[level.uniqueId].hasOwnProperty(game.uniqueId))
    {
        availableBids[level.uniqueId][game.uniqueId] = level.defaultAvailableBids;
    }
}

JackpotUser.prototype.getJackpotAvailableBids = function()
{
    return this.availableBids['jackpot'];
}

JackpotUser.prototype.getNormalBattleAvailableBids = function(level, game)
{
    var availableBids = this.availableBids['normalBattle'];

    if(!availableBids.hasOwnProperty(level.uniqueId))
    {
        availableBids[level.uniqueId] = {};
    }
    if(!availableBids[level.uniqueId].hasOwnProperty(game.uniqueId))
    {
        availableBids[level.uniqueId][game.uniqueId] = [];
    }
    return availableBids[level.uniqueId][game.uniqueId];
}

JackpotUser.prototype.getAdvanceBattleAvailableBids = function(level, game)
{
    var availableBids = this.availableBids['advanceBattle'];

    if(!availableBids.hasOwnProperty(level.uniqueId))
    {
        availableBids[level.uniqueId] = {};
    }
    if(!availableBids[level.uniqueId].hasOwnProperty(game.uniqueId))
    {
        availableBids[level.uniqueId][game.uniqueId] = [];
    }
    return availableBids[level.uniqueId][game.uniqueId];
}

JackpotUser.prototype.setDefaultBattlePlacedBids = function(battleGame)
{
    var level = battleGame.level;

    if(battleGame instanceof NormalBattleLGame)
    {
        this.setDefaultBattleTypePlacedBids(level, battleGame, 'normalBattle');
    }
    else if(battleGame instanceof AdvanceBattleLGame)
    {
        this.setDefaultBattleTypePlacedBids(level, battleGame, 'advanceBattle');
    }
}

JackpotUser.prototype.setDefaultBattleTypePlacedBids = function(level, game, type)
{
    var placedBids = this.placedBids[type];

    if(!placedBids.hasOwnProperty(level.uniqueId))
    {
        placedBids[level.uniqueId] = {};
    }
    if(!placedBids[level.uniqueId].hasOwnProperty(game.uniqueId))
    {
        placedBids[level.uniqueId][game.uniqueId] = [];
    }
}

JackpotUser.prototype.getJackpotPlacedBids = function()
{
    return this.placedBids['jackpot'];
}

JackpotUser.prototype.getNormalBattlePlacedBids = function(level, game)
{
    var placedBids = this.placedBids['normalBattle'];

    if(!placedBids.hasOwnProperty(level.uniqueId))
    {
        placedBids[level.uniqueId] = {};
    }
    if(!placedBids[level.uniqueId].hasOwnProperty(game.uniqueId))
    {
        placedBids[level.uniqueId][game.uniqueId] = [];
    }
    return placedBids[level.uniqueId][game.uniqueId];
}

JackpotUser.prototype.getAdvanceBattlePlacedBids = function(level, game)
{
    var placedBids = this.placedBids['advanceBattle'];

    if(!placedBids.hasOwnProperty(level.uniqueId))
    {
        placedBids[level.uniqueId] = {};
    }
    if(!placedBids[level.uniqueId].hasOwnProperty(game.uniqueId))
    {
        placedBids[level.uniqueId][game.uniqueId] = [];
    }
    return placedBids[level.uniqueId][game.uniqueId];
}

JackpotUser.prototype.decreaseJackpotAvailableBids = function()
{
    var availableBids = this.getJackpotAvailableBids();

    if(availableBids > 0)
    {
        availableBids -= 1;
    }

    this.setJackpotAvailableBids(availableBids);
}

JackpotUser.prototype.decreaseNormalBattleAvailableBids = function(level, game)
{
    var availableBids = this.getNormalBattleAvailableBids(level, game);

    if(availableBids > 0)
    {
        availableBids -= 1;
    }

    this.setNormalBattleAvailableBids(level, game, availableBids);
}

JackpotUser.prototype.decreaseAdvanceBattleAvailableBids = function(level, game)
{
    var availableBids = this.getAdvanceBattleAvailableBids(level, game);

    if(availableBids > 0)
    {
        availableBids -= 1;
    }

    this.setAdvanceBattleAvailableBids(level, game, availableBids);
}

JackpotUser.prototype.increaseJackpotPlacedBids = function(bid)
{
    var placedBids = this.getJackpotPlacedBids();
    placedBids.push(bid);
}

JackpotUser.prototype.increaseNormalBattlePlacedBids = function(level, game, bid)
{
    var placedBids = this.getNormalBattlePlacedBids(level, game);
    placedBids.push(bid);
}

JackpotUser.prototype.increaseAdvanceBattlePlacedBids = function(level, game, bid)
{
    var placedBids = this.getAdvanceBattlePlacedBids(level, game);
    placedBids.push(bid);
}

JackpotUser.prototype.afterPlacedBid = function(bidContainer, parent, socket, bid)
{
    if(parent instanceof Jackpot)
    {
        this.afterPlacedJackpotBid(bidContainer, parent, socket, bid);
    }
    else if(parent instanceof NormalBattleLGame)
    {
        this.afterPlacedNormalBattleBid(bidContainer, parent, socket, bid);
    }
    else if(parent instanceof AdvanceBattleLGame)
    {
        this.afterPlacedAdvanceBattleBid(bidContainer, parent, socket, bid);
    }
}

JackpotUser.prototype.afterPlacedJackpotBid = function(bidContainer, parent, socket, bid)
{
    this.decreaseJackpotAvailableBids();
    this.increaseJackpotPlacedBids(bid);

    socket.emit(EVT_EMIT_JACKPOT_BID_PLACED, {
        availableBids:          this.getJackpotAvailableBids(),
        totalPlacedBids:        this.getJackpotPlacedBids().length,
        myLongestBidDuration:   bidContainer.getLongestBidDurationByUserId(this.userId)
    });

    socket.emit(EVT_EMIT_JACKPOT_CAN_I_BID, {
        canIBid: false
    });

    socket.broadcast.in(this.jackpot.getRoomName()).emit(EVT_EMIT_JACKPOT_CAN_I_BID, {
        canIBid: true
    });
}

JackpotUser.prototype.afterPlacedNormalBattleBid = function(bidContainer, game, socket, bid)
{
    var level = game.level;

    this.decreaseNormalBattleAvailableBids(level, game);
    this.increaseNormalBattlePlacedBids(level, game, bid);

    socket.emit(EVT_EMIT_NORMAL_BATTLE_BID_PLACED, {
        availableBids:          this.getNormalBattleAvailableBids(level, game),
        totalPlacedBids:        this.getNormalBattlePlacedBids(level, game).length
    });

    socket.emit(EVT_EMIT_NORMAL_BATTLE_HIDE_PLACE_BID, {status: true});

    socket.broadcast.in(game.getRoomName()).emit(EVT_EMIT_NORMAL_BATTLE_SHOW_PLACE_BID, {status: true});

    game.emitUpdatesToItsRoom();
}

JackpotUser.prototype.afterPlacedAdvanceBattleBid = function(bidContainer, game, socket, bid)
{
    var level = game.level;
    this.decreaseAdvanceBattleAvailableBids(level, game);
    this.increaseAdvanceBattlePlacedBids(level, game, bid);
}

JackpotUser.prototype.emitNoEnoughJackpotBids = function(socket)
{
    socket.emit(EVT_EMIT_NO_ENOUGH_BIDS);

    socket.emit(EVT_EMIT_JACKPOT_CAN_I_BID, {canIBid: false});

    socket.broadcast.in(this.jackpot.getRoomName()).emit(EVT_EMIT_JACKPOT_CAN_I_BID, {canIBid: true});
}

JackpotUser.prototype.emitNoEnoughNormalBattleBids = function(socket, level, game)
{
    socket.emit(EVT_EMIT_NO_ENOUGH_BIDS);

    socket.emit(EVT_EMIT_NORMAL_BATTLE_HIDE_PLACE_BID, {status: true});

    socket.broadcast.in(game.getRoomName()).emit(EVT_EMIT_NORMAL_BATTLE_SHOW_PLACE_BID, {status: true});
}

export default JackpotUser;