'use strict';

import sqldb from '../../sqldb';
import logger from '../../utils/logger';
import {sequelizeErrorHandler} from '../../utils/LiveErrorHandler';
import * as constants from '../../config/constants';
import config from '../../config/environment';
import url from 'url';


let User = sqldb.User;

const defaultAvatarUrl     = url.format({
    protocol:   '18.221.196.29',
    hostname:   config.ip,
    port:       config.port,
    pathname:   'images/avatar.jpg',
});

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
  logger.debug("Getting user profile....");

  User.find({
    where: {
      id: req.user.user_id
    },
    attributes: {
        exclude: ['password', 'salt']
    }
  })
  .then(function(user)
  {
    user = user.get({plain: true});

    if(user.photo == null)
    {
      user.photo = defaultAvatarUrl;
    }
    else
    {
      user.photo = url.format({
          protocol:   '18.221.196.29',
          hostname:   config.ip,
          port:       config.port,
          pathname:   'uploads/' + user.photo,
      });
    }

    Sequelize.query("SELECT SUM(credit) AS total_credit, SUM(debit) AS total_debit, SUM(credit) - SUM(debit) AS balance FROM `user_winning_money_statement` WHERE user_id =" + req.user.user_id, {type: Sequelize.QueryTypes.SELECT}).then(function(row)
    {
        var walletData =  row[0];

        user.careerEarnings  = walletData.total_credit;
        //user.totalDebit     = walletData.total_debit;
        user.walletBalance  = walletData.balance;

        Sequelize.query("SELECT SUM(CASE WHEN is_longest_bid_user=1 THEN 1 ELSE 0 END) AS total_longest_bids,SUM(CASE WHEN is_last_bid_user=1 THEN 1 ELSE 0 END) AS total_last_bids FROM jackpot_game_winner where user_id ="+req.user.user_id, {type: Sequelize.QueryTypes.SELECT}).then(function(bidRes)
        {
          var bidResult     = bidRes[0];
          user.longestBids  = bidResult.total_longest_bids;
          //user.lastBids   = bidResult.total_last_bids;

          Sequelize.query("SELECT GREATEST(MAX(normal_battle_longest_streak), MAX(gambling_battle_longest_streak)) AS longest_battle_streak, (SUM(normal_battle_wins) + SUM(gambling_battle_wins)) AS total_battle_wins FROM `jackpot_game_user` WHERE user_id="+req.user.user_id, {type: Sequelize.QueryTypes.SELECT}).then(function(bidData){
            var battleBidData = bidData[0];
            user.longestBattleStreak  = battleBidData.longest_battle_streak;
            user.careerBattleWins     = battleBidData.total_battle_wins;

            return res.status(200).json({
              'status': 'success',
              'data': user
            });
          });
        });
    });
  }).catch(sequelizeErrorHandler(res));
};

/**
 * Update profile
 *
 * @param  {Object} req
 * @param  {Object} res
 * @return {*}
 */
const update = function(req, res)
{
  logger.debug("Updating user profile");

  User.find({
    where: {
      id: req.user.user_id
    }
  })
  .then((function saveUpdates(updates)
  {
    return function(entity)
    {
      return entity.updateAttributes(updates)
        .then(function(updated)
        {
          updated = updated.get({plain: true});

          delete updated.password;
          delete updated.salt;

          return res.status(200).json({
            'code': 200,
            'status': 'success',
            'message': 'Profile updated successfully',
            'data': updated
          });
        });
    };
  }(req.body)))
  .catch(sequelizeErrorHandler(res));
};

/**
 * Update avatar
 *
 * @param  {Object} req
 * @param  {Object} res
 * @return {*}
 */
const avatar = function(req, res)
{
  if(req.file && req.file.filename)
  {
    User.find({
      where: {
        id: req.user.user_id
      }
    })
    .then((function savePicture(filename)
    {
      return function(entity)
      {
        return entity.updateAttributes({photo: filename})
          .then(function(updated)
          {
            const image = updated.get({plain: true}).photo;
            return res.status(200).json({
              'code': 200,
              'status': 'success',
              'message': 'Profile picture updated successfully',
              'image': url.format({
                  protocol:   '18.221.196.29',
                  hostname:   config.ip,
                  port:       config.port,
                  pathname:   'uploads/' + image
              })
            });
          });
      };
    }(req.file.filename)))
    .catch(sequelizeErrorHandler(res));
  }
};

/**
 * Get statistics
 *
 * @param  {Object} req
 * @param  {Object} res
 * @return {*}
 */
const statistics = function(req, res)
{

};

/**
 * Change profile password
 *
 * @param  {Object}   req
 * @param  {Object}   res
 * @param  {Function} next
 * @return {*}
 */
const changePassword = function(req, res, next)
{
  const userId  = req.user.user_id;
  const oldPass = String(req.body.oldPassword);
  const newPass = String(req.body.newPassword);

  User.find({
    where: {
      id: userId
    }
  })
  .then(function(user)
  {
    if(user.authenticate(oldPass))
    {
      user.password = newPass;

      return user.save()
        .then(function()
        {
          return res.status(200).json({
            'code': 200,
            'status': 'success',
            'message': 'Password changed successfully'
          });
        })
        .catch(sequelizeErrorHandler(res));
    }
    else
    {
      return res.status(403).json({
        'status': 'error',
        'code': 403,
        'message': 'You were not authenticated with old password'
      });
    }
  });
};

export default {
  index,
  update,
  avatar,
  statistics,
  changePassword
}
