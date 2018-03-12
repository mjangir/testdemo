'use strict';

import sqldb from '../../sqldb';
import logger from '../../utils/logger';
import {sequelizeErrorHandler} from '../../utils/LiveErrorHandler';
import * as constants from '../../config/constants';
import config from '../../config/environment';
import url from 'url';
import { convertSecondsToCounterTime } from '../../utils/functions';

const Sequelize = sqldb.sequelize;
var Jackpot     = sqldb.Jackpot;

const defaultAvatarUrl     = url.format({
  protocol:   config.protocol,
  hostname:   '18.221.196.29',
  port:       config.port,
  pathname:   'images/avatar.jpg',
});

/**
 * Get profile
 *
 * @param  {Object} req
 * @param  {Object} res
 * @return {*}
 */
const index = function(req, res)
{
  var jackpotId = req.query.jackpot_id || null,
      type      = req.query.type || 'LONGEST_BID',
      subQuery  = "",
      orderBy   = "";

      var mainQuery="";
      
      var mainQuery="";
          mainQuery += "SELECT u.id                                                                  AS ";
          mainQuery += "       user_id ";
          mainQuery += "       , ";
          mainQuery += "       u.username, ";
          mainQuery += "       u.photo, ";
          mainQuery += "       jgu.longest_bid_duration, ";
          mainQuery += "       jgu.last_bid_duration, ";
          mainQuery += "       ( `jgu`.`normal_battle_wins` ";
          mainQuery += "         + `jgu`.`gambling_battle_wins` )                                    AS ";
          mainQuery += "       total_wins, ";
          mainQuery += "       IF(jgu.normal_battle_longest_streak > jgu.gambling_battle_longest_streak, ";
          mainQuery += "       jgu.normal_battle_longest_streak, jgu.gambling_battle_longest_streak) AS ";
          mainQuery += "       longest_streak ";
          mainQuery += "FROM   `jackpot_game_user` AS `jgu` ";
          mainQuery += "       LEFT JOIN `user` AS u ";
          mainQuery += "              ON u.id = jgu.user_id ";
          mainQuery += "WHERE  jgu.jackpot_game_id {SUBQUERY}";
          mainQuery += "ORDER  BY {ORDER_BY} DESC ";

      
  if(jackpotId) {
    subQuery = "= (SELECT id FROM   `jackpot_game` WHERE  jackpot_id = "+jackpotId+" ORDER  BY `finished_on` DESC LIMIT  1)";
  } else {
    subQuery = "IN (SELECT max(id) as id FROM jackpot_game group by jackpot_id ORDER BY id DESC)";
  }

  switch (type) {
    case 'LONGEST_BID':
      orderBy = 'jgu.longest_bid_duration';
    break;
    case 'LAST_BID':
      orderBy = 'jgu.last_bid_duration';
    break;
    case 'TOTAL_WINS':
      orderBy = 'total_wins';
    break;
    case 'LONGEST_STREAK':
      orderBy = 'longest_streak';
    break;
    default:
      orderBy = 'total_wins';
    break;
  } 

  mainQuery = mainQuery.replace('{SUBQUERY}', subQuery);
  mainQuery = mainQuery.replace('{ORDER_BY}', orderBy);

  Sequelize.query(mainQuery, {type: Sequelize.QueryTypes.SELECT}).then(function(result){
    var rank = 1;
    result = result.map(function(record) {
      return {
          user_id:              record.user_id || 0,
          username:             record.username || "",
          photo:                record.username || defaultAvatarUrl,
          longest_bid_duration: record.longest_bid_duration ? getHumanDuration(record.longest_bid_duration) : 0,
          last_bid_duration:    record.last_bid_duration ? getHumanDuration(record.last_bid_duration) : 0,
          total_wins:           record.total_wins ? record.total_wins : 0,
          longest_streak:       record.longest_streak ? longest_streak.total_wins : 0,
          rank:                 ++rank,
          score:                getLeaderboardScore(record, type)
      };
    });
    return res.status(200).json({
      'status': 'success',
      'data': result
    });
  }).catch(function()
  {
    return res.status(500).json({
      'status': 'error',
      'data': 'Error occured while processing'
    });
  });

};

const getLeaderboardScore = function(record, type) {
  switch (type) {
    case 'LONGEST_BID':
      return record.longest_bid_duration ? getHumanDuration(record.longest_bid_duration) : 0;
    break;
    case 'LAST_BID':
    return record.last_bid_duration ? getHumanDuration(record.last_bid_duration) : 0;
    break;
    case 'TOTAL_WINS':
      return record.total_wins || 0;
    break;
    case 'LONGEST_STREAK':
      return record.longest_streak || 0;
    break;
    default:
      return record.total_wins || 0;
    break;
  } 
}

const getHumanDuration = function(seconds) {
  return msToTime(seconds);
}

function msToTime(duration) {
  var milliseconds = parseInt((duration%1000)/100)
      , seconds = parseInt((duration/1000)%60)
      , minutes = parseInt((duration/(1000*60))%60)
      , hours = parseInt((duration/(1000*60*60))%24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}

export default {
  index
}