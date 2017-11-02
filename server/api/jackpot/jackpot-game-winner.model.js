'use strict';

module.exports = function(sequelize, DataTypes)
{
  var JackpotGameWinner = sequelize.define('JackpotGameWinner', {
    id: {
      type            : DataTypes.INTEGER(11),
      allowNull       : false,
      primaryKey      : true,
      autoIncrement   : true,
      comment         : "Primary and auto increment key of the table"
    },

    jackpotAmount : {
      field       : "jackpot_amount",
      type        : DataTypes.DECIMAL(10,2),
      allowNull   : false,
      comment     : "Jackpot Total Amount"
    },

    winningAmount : {
      field       : "winning_amount",
      type        : DataTypes.DECIMAL(10,2),
      allowNull   : false,
      comment     : "Jackpot Winning Amount"
    },

    isLastBidUser : {
      field       : "is_last_bid_user",
      type        : DataTypes.BOOLEAN,
      defaultValue: 0,
      comment     : "Is Last Bid User"
    },

    isLongestBidUser : {
      field       : "is_longest_bid_user",
      type        : DataTypes.BOOLEAN,
      defaultValue: 0,
      comment     : "Is Last Bid User"
    }
  },
  {
    freezeTableName   : true,
    tableName         : 'jackpot_game_winner',

    classMethods:{
      associate:function(models)
      {
        JackpotGameWinner.belongsTo(models.User, {
          as          : 'WinnerUser',
          constraints : true,
          foreignKey  : {
            name      : 'userId',
            field     : 'user_id',
            allowNull : false
          }
        });

        JackpotGameWinner.belongsTo(models.JackpotGame, {
          as          : 'JackpotGame',
          constraints : true,
          foreignKey  : {
            name      : 'jackpotGameId',
            field     : 'jackpot_game_id',
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

  return JackpotGameWinner;
};
