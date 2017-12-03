'use strict';

import {
    EVT_EMIT_NO_ENOUGH_BIDS,
	EVT_EMIT_JACKPOT_CAN_I_BID,
	EVT_EMIT_JACKPOT_GAME_JOINED,
	EVT_EMIT_JACKPOT_BID_PLACED,
    EVT_EMIT_JACKPOT_GAME_QUITTED,
    EVT_EMIT_JACKPOT_MY_INFO_CHANGED,

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
    EVT_EMIT_ADVANCE_BATTLE_GAME_QUITTED,

    EVT_EMIT_JACKPOT_AVAILABLE_BID_ON_BATTLE_WIN,
    EVT_EMIT_JACKPOT_UPDATE_BATTLE_STREAK
} from '../../constants';

import {
	convertAmountToCommaString,
	getUserObjectById
} from '../../../utils/functions';

import Jackpot from './jackpot';
import NormalBattleLGame from '../normal-battle/normal-battle-game';
import AdvanceBattleLGame from '../advance-battle/advance-battle-game';
import _ from 'lodash';

/**
 * Constructor
 *
 * @param {Jackpot} jackpot
 * @param {Integer} userId
 */
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

/**
 * Is Quitted
 *
 * @return {Boolean}
 */
JackpotUser.prototype.isQuitted = function()
{
	return this.userGameStatus == 'QUITTED';
}

/**
 * Mark As In-Active
 *
 * @return {*}
 */
JackpotUser.prototype.markAsInactive = function()
{
	var context = this;

	this.isActive = false;

	return new Promise(function(resolve, reject)
	{
		resolve(context.jackpot);
	});
}

/**
 * Get Normal Battle Total Winnings
 *
 * @param  {NormalBattleLevel} level
 * @return {Integer}
 */
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
 * All the following methods are fired immediately after
 * joining a jackpot, normal battle and advance battle.
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

/**
 * After Joining Any Battle Level Game
 *
 * @param  {Socket} socket
 * @param  {BattleLevel} level
 * @param  {BattleGame} game
 * @return {*}
 */
JackpotUser.prototype.afterJoinBattle = function(socket, level, game)
{
    if(level.constructor.name == 'NormalBattleLevel')
    {
        this.afterJoinNormalBattle(socket, level, game);
    }
    else if(level.constructor.name == 'AdvanceBattleLevel')
    {
        this.afterJoinAdvanceBattle(socket, level, game);
    }
}

/**
 * After Joining Normal Battle Level Game
 *
 * @param  {Socket} socket
 * @param  {BattleLevel} level
 * @param  {BattleGame} game
 * @return {*}
 */
JackpotUser.prototype.afterJoinNormalBattle = function(socket, level, game)
{
    var evtJoined       = EVT_EMIT_NORMAL_BATTLE_JOINED,
        evtShowBidBtn   = EVT_EMIT_NORMAL_BATTLE_SHOW_PLACE_BID,
        evtHideBidBtn   = EVT_EMIT_NORMAL_BATTLE_HIDE_PLACE_BID,
        evtShowQuitBtn  = EVT_EMIT_NORMAL_BATTLE_SHOW_QUIT_BUTTON,
        availableBids   = this.getNormalBattleAvailableBids(level, game),
        totalPlacedBids = this.getNormalBattlePlacedBids(level, game).length,
        lastBidUserId   = game.bidContainer.getLastBidUserId();

    // Emit Joined Event
    socket.emit(evtJoined, {
        jackpotInfo     : this.jackpot.getBasicInfo(),
        levelInfo       : level.getBasicInfo(),
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
    if(game.isNotStarted() || (lastBidUserId != null && lastBidUserId == this.userId))
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
 * After Joining Advance Battle Level Game
 *
 * @param  {Socket} socket
 * @param  {BattleLevel} level
 * @param  {BattleGame} game
 * @return {*}
 */
JackpotUser.prototype.afterJoinAdvanceBattle = function(socket, level, game)
{
    var evtJoined       = EVT_EMIT_ADVANCE_BATTLE_JOINED,
        evtShowBidBtn   = EVT_EMIT_ADVANCE_BATTLE_SHOW_PLACE_BID,
        evtHideBidBtn   = EVT_EMIT_ADVANCE_BATTLE_HIDE_PLACE_BID,
        evtShowQuitBtn  = EVT_EMIT_ADVANCE_BATTLE_SHOW_QUIT_BUTTON,
        availableBids   = this.getAdvanceBattleAvailableBids(level, game),
        totalPlacedBids = this.getAdvanceBattlePlacedBids(level, game).length,
        lastBidUserId   = game.bidContainer.getLastBidUserId();

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
    if(game.isNotStarted() || (lastBidUserId != null && lastBidUserId == this.userId))
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
 * All the methods below are completely related to
 * quit a jackpot, normal battle and advance battle
 * game.
 */

/**
 * Quit Jackpot Game
 *
 * @param  {Socket} socket
 * @return {*}
 */
JackpotUser.prototype.quitJackpotGame = function(socket)
{
    this.userGameStatus = 'QUITTED';

    socket.emit(EVT_EMIT_JACKPOT_GAME_QUITTED, {status: true});

    this.jackpot.emitUpdatesToItsRoom();
}

/**
 * Quit Normal Battle Game
 *
 * @param  {Socket} socket
 * @param  {NormalBattleLevel} level
 * @param  {NormalBattleGame} game
 * @return {*}
 */
JackpotUser.prototype.quitNormalBattleGame = function(socket, level, game)
{
    var removed = game.removeUser(this);

    if(removed)
    {
        socket.emit(EVT_EMIT_NORMAL_BATTLE_GAME_QUITTED);

        game.emitUpdatesToItsRoom(socket);
    }
}

/**
 * Quit Advance Battle Game
 *
 * @param  {Socket} socket
 * @param  {NormalBattleLevel} level
 * @param  {NormalBattleGame} game
 * @return {*}
 */
JackpotUser.prototype.quitAdvanceBattleGame = function(socket, level, game)
{
    var removed     = game.removeUser(this),
        evtMyJpInfo = EVT_EMIT_JACKPOT_MY_INFO_CHANGED;

    if(removed)
    {
        socket.emit(EVT_EMIT_ADVANCE_BATTLE_GAME_QUITTED);

        // Restore user's jackpot available bids deducted to join the game
        this.increaseJackpotAvailableBids(level.minBidsToGamb)
        socket.emit(evtMyJpInfo, {
            name            : getUserObjectById(this.userId).name,
            availableBids   : this.getJackpotAvailableBids(),
            totalPlacedBids : this.getJackpotPlacedBids(),
        });

        game.emitUpdatesToItsRoom(socket);
    }
}









/**
 * The below are only Bid Related function to get anytime jackpot,
 * normal battle and advance battle available bids, placed bids as
 * well as set default available bids and placed bids. Also increase
 * or decrease the available and placed bids for all of them
 */

/**
 * Set Jackpot Available Bids
 *
 * @param {Integer} bids
 */
JackpotUser.prototype.setJackpotAvailableBids = function(bids)
{
    this.availableBids['jackpot'] = bids;
}

/**
 * Set Normal Battle Available Bids
 *
 * @param {NormalBattleLevel} level
 * @param {NormalBattleGame} game
 * @param {Integer} bids
 */
JackpotUser.prototype.setNormalBattleAvailableBids = function(level, game, bids)
{
    this.availableBids['normalBattle'][level.uniqueId][game.uniqueId] = bids;
}

/**
 * Set Advance Battle Available Bids
 *
 * @param {AdvanceBattleLevel} level
 * @param {AdvanceBattleGame} game
 * @param {Integer} bids
 */
JackpotUser.prototype.setAdvanceBattleAvailableBids = function(level, game, bids)
{
    this.availableBids['advanceBattle'][level.uniqueId][game.uniqueId] = bids;
}

/**
 * Set Default Jackpot Available Bids
 *
 * @return {*}
 */
JackpotUser.prototype.setDefaultJackpotAvailableBids = function()
{
    var key         = 'jackpot_setting_default_bid_per_user_per_game',
        settings    = global.ticktockGameState.settings,
        defaultBid  = (settings.hasOwnProperty(key) && settings[key] != "") ? parseInt(settings[key], 10) : 10;

    this.availableBids['jackpot'] = defaultBid;
}

/**
 * Set Default Battle Available Bids
 *
 * @param {BattleGame} battleGame
 * @return {*}
 */
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

/**
 * Set Default Battle Type Avaiable Bids
 *
 * @param {NormalBattleLevel|AdvanceBattleLevel} level
 * @param {NormalBattleGame|AdvanceBattleGame} game
 * @param {String} type
 */
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

/**
 * Get Jackpot Available Bids
 *
 * @return {Integer}
 */
JackpotUser.prototype.getJackpotAvailableBids = function()
{
    return this.availableBids['jackpot'];
}

/**
 * Get Normal Battle Available Bids
 *
 * @param  {NormalBattleLevel} level
 * @param  {NormalBattleGame} game
 * @return {*}
 */
JackpotUser.prototype.getNormalBattleAvailableBids = function(level, game)
{
    var availableBids = this.availableBids['normalBattle'];

    if(!availableBids.hasOwnProperty(level.uniqueId))
    {
        availableBids[level.uniqueId] = {};
    }
    if(!availableBids[level.uniqueId].hasOwnProperty(game.uniqueId))
    {
        availableBids[level.uniqueId][game.uniqueId] = level.defaultAvailableBids;
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
        availableBids[level.uniqueId][game.uniqueId] = level.defaultAvailableBids;
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

JackpotUser.prototype.decreaseJackpotAvailableBids = function(count)
{
    var availableBids   = this.getJackpotAvailableBids(),
        howMany         = count || 1;

    if(availableBids > 0)
    {
        availableBids -= howMany;
    }

    this.setJackpotAvailableBids(availableBids);
}

JackpotUser.prototype.decreaseNormalBattleAvailableBids = function(level, game, count)
{
    var availableBids   = this.getNormalBattleAvailableBids(level, game),
        howMany         = count || 1;

    if(availableBids > 0)
    {
        availableBids -= howMany;
    }

    this.setNormalBattleAvailableBids(level, game, availableBids);
}

JackpotUser.prototype.decreaseAdvanceBattleAvailableBids = function(level, game, count)
{
    var availableBids   = this.getAdvanceBattleAvailableBids(level, game),
        howMany         = count || 1;

    if(availableBids > 0)
    {
        availableBids -= howMany;
    }

    this.setAdvanceBattleAvailableBids(level, game, availableBids);
}

JackpotUser.prototype.increaseJackpotAvailableBids = function(count)
{
    var availableBids   = this.getJackpotAvailableBids(),
        howMany         = count || 1;

    if(availableBids > 0)
    {
        availableBids += howMany;
    }

    this.setJackpotAvailableBids(availableBids);
}

JackpotUser.prototype.increaseNormalBattleAvailableBids = function(level, game, count)
{
    var availableBids   = this.getNormalBattleAvailableBids(level, game),
        howMany         = count || 1;

    if(availableBids > 0)
    {
        availableBids += howMany;
    }

    this.setNormalBattleAvailableBids(level, game, availableBids);
}

JackpotUser.prototype.increaseAdvanceBattleAvailableBids = function(level, game, count)
{
    var availableBids   = this.getAdvanceBattleAvailableBids(level, game),
        howMany         = count || 1;

    if(availableBids > 0)
    {
        availableBids += howMany;
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

    socket.emit(EVT_EMIT_ADVANCE_BATTLE_BID_PLACED, {
      availableBids:          this.getAdvanceBattleAvailableBids(level, game),
      totalPlacedBids:        this.getAdvanceBattlePlacedBids(level, game).length
  });

  socket.emit(EVT_EMIT_ADVANCE_BATTLE_HIDE_PLACE_BID, {status: true});

  socket.broadcast.in(game.getRoomName()).emit(EVT_EMIT_ADVANCE_BATTLE_SHOW_PLACE_BID, {status: true});

  game.emitUpdatesToItsRoom();
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

JackpotUser.prototype.emitNoEnoughAdvanceBattleBids = function(socket, level, game)
{
    socket.emit(EVT_EMIT_NO_ENOUGH_BIDS);

    socket.emit(EVT_EMIT_ADVANCE_BATTLE_HIDE_PLACE_BID, {status: true});

    socket.broadcast.in(game.getRoomName()).emit(EVT_EMIT_ADVANCE_BATTLE_SHOW_PLACE_BID, {status: true});
}


/**
 * After Battle Game Finished Functions
 * Update the streaks, winnings and looses on user
 */
JackpotUser.prototype.afterBattleGameFinished = function(game, level, status, prize)
{
    var winsArr = level.constructor.name == 'NormalBattleLevel' ? this.battleWins['normalBattle'] : this.battleWins['advanceBattle'],
        bothBattleWins,
        battleStreakData;

    if(status == 'WINNER')
    {
        this.increaseJackpotAvailableBids(prize);
        this.currentSocket.emit(EVT_EMIT_JACKPOT_AVAILABLE_BID_ON_BATTLE_WIN, {
          availableBids: this.getJackpotAvailableBids()
        });
    }

    winsArr.push({
        gameUniqueId    : game.uniqueId,
        levelUniqueId   : level.uniqueId,
        winningStatus   : status
    });

    this.currentSocket.emit(EVT_EMIT_JACKPOT_UPDATE_BATTLE_STREAK, {
      battleWins  : this.getTotalBattleWins(),
      battleStreak: this.getCurrentBattleStreak()
    })
}

JackpotUser.prototype.getTotalNormalBattleWins = function()
{
  var records = this.battleWins['normalBattle'].filter(function(item)
  {
    return item.winningStatus == 'WINNER';
  });

  return records.length;
}

JackpotUser.prototype.getTotalAdvanceBattleWins = function()
{
  var records = this.battleWins['advanceBattle'].filter(function(item)
  {
    return item.winningStatus == 'WINNER';
  });

  return records.length;
}

JackpotUser.prototype.getTotalBattleWins = function()
{
  return this.getTotalNormalBattleWins() + this.getTotalAdvanceBattleWins();
}

JackpotUser.prototype.getTotalNormalBattleLooses = function()
{
  var records = this.battleWins['normalBattle'].filter(function(item)
  {
    return item.winningStatus == 'LOOSER';
  });

  return records.length;
}

JackpotUser.prototype.getTotalAdvanceBattleLooses = function()
{
  var records = this.battleWins['advanceBattle'].filter(function(item)
  {
    return item.winningStatus == 'LOOSER';
  });

  return records.length;
}

JackpotUser.prototype.getTotalBattleLooses = function()
{
  return this.getTotalNormalBattleLooses() + this.getTotalAdvanceBattleLooses();
}

JackpotUser.prototype.getCurrentBattleStreak = function()
{
  var bothBattleWins    = this.battleWins['normalBattle'].concat(this.battleWins['advanceBattle']),
      battleStreakData  = this.getBattleStreakData(bothBattleWins);

  if(bothBattleWins.length == 0 || bothBattleWins[bothBattleWins.length - 1].winningStatus == 'LOOSER')
  {
    return 0;
  }

  if(battleStreakData.length == 0)
  {
    return 0;
  }

  return battleStreakData[battleStreakData.length - 1]['times'];
}

JackpotUser.prototype.getNormalBattleLongestStreak = function()
{
  return this.getLongestBattleStreak(this.battleWins['normalBattle']);
}

JackpotUser.prototype.getAdvanceBattleLongestStreak = function()
{
  return this.getLongestBattleStreak(this.battleWins['advanceBattle']);
}

JackpotUser.prototype.getLongestBattleStreak = function(input)
{
  var streakData;

  if(input.length == 0 || input[input.length - 1].winningStatus == 'LOOSER')
  {
    return 0;
  }

  streakData = this.getBattleStreakData(input);

  if(streakData.length == 0)
  {
    return 0;
  }

  return _.max(streakData.map(function(a){
		return a.times;
	}));
}

JackpotUser.prototype.getBattleStreakData = function(input)
{
  var output = [];

  for(var k in input)
  {
    if (!output[output.length-1] || output[output.length-1].value != input[k].winningStatus)
    {
      output.push({value: input[k].winningStatus, times: 1})
    }
    else
    {
      output[output.length-1].times++;
    }
  }

  return _.filter(output, {value: 'WINNER'});
}

export default JackpotUser;
