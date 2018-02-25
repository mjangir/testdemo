'use strict';

module.exports = function(sequelize, DataTypes)
{
  var JackpotGameUser = sequelize.define('JackpotGameUser', {
    id: {
      type            : DataTypes.INTEGER(11),
      allowNull       : false,
      primaryKey      : true,
      autoIncrement   : true,
      comment         : "Primary and auto increment key of the table"
    },

    remainingAvailableBids : {
      field       : "remaining_available_bids",
      type        : DataTypes.INTEGER(11),
      allowNull   : true,
      comment     : "Remaining available bids"
    },

    totalNumberOfBids : {
      field       : "total_number_of_bids",
      type        : DataTypes.INTEGER(11),
      allowNull   : true,
      comment     : "Total number of bids placed by this user"
    },

    longestBidDuration : {
      field       : "longest_bid_duration",
      type        : DataTypes.INTEGER(11),
      allowNull   : true,
      comment     : "Longest bid duration of this user"
    },

    lastBidDuration : {
      field       : "last_bid_duration",
      type        : DataTypes.INTEGER(11),
      allowNull   : true,
      comment     : "Last bid duration of this user"
    },

    normalBattleWins : {
      field       : "normal_battle_wins",
      type        : DataTypes.INTEGER(11),
      allowNull   : true,
      comment     : ""
    },

    gamblingBattleWins : {
      field       : "gambling_battle_wins",
      type        : DataTypes.INTEGER(11),
      allowNull   : true,
      comment     : ""
    },

    normalBattleLooses : {
      field       : "normal_battle_looses",
      type        : DataTypes.INTEGER(11),
      allowNull   : true,
      comment     : ""
    },

    gamblingBattleLooses : {
      field       : "gambling_battle_looses",
      type        : DataTypes.INTEGER(11),
      allowNull   : true,
      comment     : ""
    },

    normalBattleLongestStreak : {
      field       : "normal_battle_longest_streak",
      type        : DataTypes.INTEGER(11),
      allowNull   : true,
      comment     : ""
    },

    gamblingBattleLongestStreak : {
      field       : "gambling_battle_longest_streak",
      type        : DataTypes.INTEGER(11),
      allowNull   : true,
      comment     : ""
    },

    joinedOn : {
      field         : "joined_on",
      type          : DataTypes.DATE,
      allowNull     : true,
      comment       : "When this particular user joined the game"
    },

    quittedOn : {
      field         : "quitted_on",
      type          : DataTypes.DATE,
      allowNull     : true,
      comment       : "If user quitted the game, what is the time"
    }
  },
  {
    freezeTableName   : true,
    tableName         : 'jackpot_game_user',

    classMethods:{
      associate:function(models)
      {
        JackpotGameUser.belongsTo(models.User, {
          as          : 'PlayingUser',
          constraints : true,
          foreignKey  : {
            name      : 'userId',
            field     : 'user_id',
            allowNull : true
          }
        });

        JackpotGameUser.belongsTo(models.JackpotGame, {
          as          : 'JackpotGame',
          constraints : true,
          foreignKey  : {
            name      : 'jackpotGameId',
            field     : 'jackpot_game_id',
            allowNull : true
          }
        });

        JackpotGameUser.hasMany(models.JackpotGameUserBid, {
          as          : 'JackpotGameUserBids',
          constraints : true,
          foreignKey  : {
            name      : 'jackpotGameUserId',
            field     : 'jackpot_game_user_id',
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

  return JackpotGameUser;
};
