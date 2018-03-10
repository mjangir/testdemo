'use strict';

import sqldb from '../../sqldb';
import logger from '../../utils/logger';
import {sequelizeErrorHandler} from '../../utils/LiveErrorHandler';
import * as constants from '../../config/constants';
import config from '../../config/environment';
import url from 'url';

const Sequelize = sqldb.sequelize;
var Jackpot     = sqldb.Jackpot;

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
    console.log(result);
  });

};

export default {
  index
}