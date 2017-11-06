'use strict';

import logger from '../utils/logger';
import moment from 'moment';
import sqldb from '../sqldb';
import JackpotState from './state/jackpot/jackpot';

const SettingsModel             = sqldb.Settings;
const JackpotModel              = sqldb.Jackpot;
const UserModel                 = sqldb.User;
const JackpotBattleLevelModel   = sqldb.JackpotBattleLevel;

/**
 * Get All Users
 *
 * @return {Promise}
 */
function getAllUsers()
{
    return UserModel.findAll({raw: true, attributes: ['id', 'name', 'email', 'gender', 'photo']});
}

/**
 * Get All Settings
 *
 * @return {Promise}
 */
function getAllSettings()
{
    return SettingsModel.findAll({raw: true});
}

/**
 * Get All Jackpots
 *
 * @return {Promise}
 */
function getAllJackpots()
{
    return JackpotModel.findAll({
        attributes: [
            'id',
            'title',
            'amount',
            'minPlayersRequired',
            'gameClockTime',
            'doomsDayTime',
            'increaseAmountSeconds',
            'increaseAmount',
            'gameStatus',
            'uniqueId',
            'status'
        ],
        order: [
            ['id', 'ASC']
        ],
        include: [ { model: JackpotBattleLevelModel, as: 'JackpotBattleLevels'} ]
    });
}

/**
 * Create Jackpot Game State
 *
 * @return {Promise}
 */
function createJackpotGameState(jackpots)
{
    if(jackpots.length > 0)
    {
        for(var k in jackpots)
        {
            global.ticktockGameState.jackpots.push(new JackpotState(jackpots[k]));
        }
    }

    return new Promise(function(resolve, reject)
    {
        resolve(jackpots);
    });
}

/**
 * Get Simplified Jackpots Data
 *
 * @param  {Array} jackpots
 * @return {Array}
 */
function getSimplifiedJackpots(jackpots)
{
    return jackpots.map(function(jp)
    {
        return jp.get({ plain: true });
    });
}

/**
 * Get Simplified Settings
 *
 * @param  {Array} settings
 * @return {Object}
 */
function getSimplifiedSettings(settings)
{
    var obj = {};

    for(var k in settings)
    {
        obj[settings[k].key] = settings[k].value;
    }
    return obj;
}

/**
 * Create Global Game State
 *
 * @param  {Socket.IO} socketio
 * @return {*}
 */
export default function(socketio)
{
    // Get All Settings
    return getAllSettings()
    .then(function(settings)
    {
        global.ticktockGameState.settings = getSimplifiedSettings(settings);
        return getAllUsers();
    
    }).then(function(users)
    {
        global.ticktockGameState.users = users;
        return getAllJackpots();
    
    }).then(function(jackpots)
    {
        const simplified = getSimplifiedJackpots(jackpots);
        return createJackpotGameState(simplified);

    }).catch(function(err)
    {
        return err;
    });
}