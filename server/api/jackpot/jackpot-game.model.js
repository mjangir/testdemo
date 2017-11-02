'use strict';

module.exports = function(sequelize, DataTypes)
{
  var JackpotGame = sequelize.define('JackpotGame', {
    id: {
      type            : DataTypes.INTEGER(11),
      allowNull       : false,
      primaryKey      : true,
      autoIncrement   : true,
      comment         : "Primary and auto increment key of the table"
    },

    totalUsersParticipated : {
      field       : "total_users_participated",
      type        : DataTypes.INTEGER(11),
      allowNull   : false,
      comment     : "Total number of users participated in this game"
    },

    totalNumberOfBids : {
      field       : "total_number_of_bids",
      type        : DataTypes.INTEGER(11),
      allowNull   : false,
      comment     : "Total number of bids placed on this game"
    },

    longestBidDuration : {
      field       : "longest_bid_duration",
      type        : DataTypes.INTEGER(11),
      allowNull   : false,
      comment     : "Longest bid duration"
    },

    lastBidDuration : {
      field       : "last_bid_duration",
      type        : DataTypes.INTEGER(11),
      allowNull   : false,
      comment     : "Last bid duration"
    },

    startedOn : {
      field         : "started_on",
      type          : DataTypes.DATE,
      allowNull     : true,
      comment       : "When the game started"
    },

    finishedOn : {
      field         : "finished_on",
      type          : DataTypes.DATE,
      allowNull     : true,
      comment       : "When the game finished"
    }
  },
  {
    freezeTableName   : true,
    tableName         : 'jackpot_game',

    classMethods:{
      associate:function(models)
      {
        JackpotGame.belongsTo(models.User, {
          as          : 'LongestBidWinnerUser',
          constraints : true,
          foreignKey  : {
            name      : 'longestBidWinnerUserId',
            field     : 'longest_bid_winner_user_id',
            allowNull : true
          }
        });

        JackpotGame.belongsTo(models.User, {
          as          : 'LastBidWinnerUser',
          constraints : true,
          foreignKey  : {
            name      : 'lastBidWinnerUserId',
            field     : 'last_bid_winner_user_id',
            allowNull : true
          }
        });

        JackpotGame.hasMany(models.JackpotGameUser, {
          as          : 'JackpotGameUsers',
          constraints : true,
          foreignKey  : {
            name      : 'jackpotGameId',
            field     : 'jackpot_game_id',
            allowNull : false
          }
        });

        JackpotGame.hasMany(models.JackpotGameWinner, {
          as          : 'JackpotGameWinners',
          constraints : true,
          foreignKey  : {
            name      : 'jackpotGameId',
            field     : 'jackpot_game_id',
            allowNull : false
          }
        });

        JackpotGame.belongsTo(models.Jackpot, {
          as          : 'Jackpot',
          constraints : true,
          foreignKey  : {
            name      : 'jackpotId',
            field     : 'jackpot_id',
            allowNull : false
          }
        });
      }
    },
    defaultScope: {
    },
    scopes: {
    }
  });

  return JackpotGame;
};
