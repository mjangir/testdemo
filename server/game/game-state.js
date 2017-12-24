'use strict';

import logger from '../utils/logger';
import moment from 'moment';
import sqldb from '../sqldb';
import config from '../config/environment';
import JackpotState from './state/jackpot/jackpot';
import _ from 'lodash';
import url from 'url';

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
            'defaultAvailableBids',
            'increaseSecondsOnBid',
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
 * Get User Photo
 *
 * @param  {Object} user
 * @return {String}
 */
function getUserPhoto(user)
{
    const photo     = user.photo != null ? 'uploads/'+user.photo : 'images/avatar.jpg';
    const avatarUrl = url.format({
        protocol:   config.protocol,
        hostname:   config.ip,
        port:       config.port,
        pathname:   photo,
    });
    return avatarUrl;
}

/**
 * Get Simplified Users
 *
 * @param  {Array} users
 * @return {[type]}       [description]
 */
function getSimplifiedUsers(users)
{
    users = _.map(users).map(function(user)
    {
        return _.assign(user,
        {
            photo: getUserPhoto(user)
        });
    });

    return users;
}

/**
 * Find Jackpot By ID
 * 
 * @param {any} id 
 */
function findJackpotById(id)
{
  return _.find(global.ticktockGameState.jackpots, {id: id});
}

/**
 * Update Jackpot Params In State
 * 
 * 
 * @param {any} jackpot 
 */
export function updateJackpotParamsInState(jackpot)
{
  var jackpots = global.ticktockGameState.jackpots,
      existing;

  if(jackpots.length > 0 && findJackpotById(jackpot.id))
  {
    existing = findJackpotById(jackpot.id);
    existing.title = jackpot.title;
  }
}

/**
 * Get Jackpot By Unique ID
 * 
 * @export
 * @param {any} uniqueId 
 */
export function getJackpotByUniqueId(uniqueId)
{
  return _.find(global.ticktockGameState.jackpots, {uniqueId: uniqueId});
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
        global.ticktockGameState.users = getSimplifiedUsers(users);
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
