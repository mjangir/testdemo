'use strict';

import sqldb from '../../sqldb';
import logger from '../../utils/logger';
import {sequelizeErrorHandler} from '../../utils/LiveErrorHandler';
import * as constants from '../../config/constants';
import config from '../../config/environment';
import url from 'url';

const Sequelize = sqldb.sequelize;

/**
 * Get profile
 *
 * @param  {Object} req
 * @param  {Object} res
 * @return {*}
 */
const index = function(req, res)
{
  console.log(req);
  var jackpotId = req.body.jackpot_id || null,
      type      = req.type || 'LONGEST_BID';

      return res.status(200).json({
        'status': 'success',
        'data': {
          jackpotId: jackpotId,
          type: type
        }
      });

  
    // Sequelize.query("SELECT SUM(credit) AS total_credit, SUM(debit) AS total_debit, SUM(credit) - SUM(debit) AS balance FROM `user_winning_money_statement` WHERE user_id =" + req.user.user_id, {type: Sequelize.QueryTypes.SELECT}).then(function(row)
    // {
    //     var walletData =  row[0];

    //     user.careerEarning  = walletData.total_credit;
    //     user.totalDebit     = walletData.total_debit;
    //     user.walletBalance  = walletData.balance;

    //     Sequelize.query("SELECT SUM(CASE WHEN is_longest_bid_user=1 THEN 1 ELSE 0 END) AS total_longest_bids,SUM(CASE WHEN is_last_bid_user=1 THEN 1 ELSE 0 END) AS total_last_bids FROM jackpot_game_winner where user_id ="+req.user.user_id, {type: Sequelize.QueryTypes.SELECT}).then(function(bidRes)
    //     {
    //       var bidResult           = bidRes[0];
    //       user.totalLongestBids   = bidResult.total_longest_bids;
    //       user.totalLastBids      = bidResult.total_last_bids;

    //       Sequelize.query("SELECT GREATEST(MAX(normal_battle_longest_streak), MAX(gambling_battle_longest_streak)) AS longest_battle_streak, (SUM(normal_battle_wins) + SUM(gambling_battle_wins)) AS total_battle_wins FROM `jackpot_game_user` WHERE user_id="+req.user.user_id, {type: Sequelize.QueryTypes.SELECT}).then(function(bidData){
    //         var battleBidData = bidData[0];
    //         user.longestBattleStreak    = battleBidData.longest_battle_streak;
    //         user.totalBattleWins        = battleBidData.total_battle_wins;

    //         return res.status(200).json({
    //           'status': 'success',
    //           'data': user
    //         });
    //       });
    //     });
    // }).catch(sequelizeErrorHandler(res));
};

export default {
  index
}