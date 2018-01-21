'use strict';

module.exports = function(sequelize, DataTypes)
{
  var JackpotBattleLevel = sequelize.define('JackpotBattleLevel', {
    id: {
      type            : DataTypes.INTEGER(11),
      allowNull       : false,
      primaryKey      : true,
      autoIncrement   : true,
      comment         : "Primary and auto increment key of the table"
    },

    battleType: {
      field         : "battle_type",
      type          : DataTypes.ENUM('NORMAL','ADVANCE'),
      allowNull     : false,
      defaultValue  : 'NORMAL',
      comment       : "Type of battle"
    },

    order: {
      field           : 'order',
      type            : DataTypes.INTEGER(11),
      allowNull       : false,
      defaultValue    : 0,
      comment         : "Order Of Level"
    },

    levelName : {
      field       : "level_name",
      type        : DataTypes.STRING(255),
      allowNull   : false,
      comment     : "Name Of Level"
    },

    duration : {
      field         : "duration",
      type          : DataTypes.INTEGER(11),
      allowNull     : false,
      defaultValue  : 0,
      comment       : "Level Game Duration"
    },

    incrementSeconds : {
      field         : "increment_seconds",
      type          : DataTypes.INTEGER(11),
      allowNull     : false,
      defaultValue  : 0,
      comment       : "Level Game Increment Seconds"
    },

    prizeType: {
      field         : "prize_type",
      type          : DataTypes.ENUM('BID','MONEY'),
      allowNull     : false,
      defaultValue  : 'BID',
      comment       : "Type of this prize"
    },

    prizeValue : {
      field         : "prize_value",
      type          : DataTypes.DECIMAL(10,2),
      allowNull     : false,
      defaultValue  : '0.00',
      comment       : "Prize value"
    },

    minBidsToGamb: {
      field           : 'min_bids_to_gamb',
      type            : DataTypes.INTEGER(11),
      allowNull       : true,
      defaultValue    : 1,
      comment         : "Min Bids To Gamb"
    },

    defaultAvailableBids: {
      field           : 'default_available_bids',
      type            : DataTypes.INTEGER(11),
      allowNull       : false,
      defaultValue    : 0,
      comment         : "Default Available Bids"
    },

    lastBidWinnerPercent : {
      field         : "last_bid_winner_percent",
      type          : DataTypes.DECIMAL(10,2),
      allowNull     : false,
      defaultValue  : '0.00',
      comment       : "Last Bid Winner Percent (only if different)"
    },

    longestBidWinnerPercent : {
      field         : "longest_bid_winner_percent",
      type          : DataTypes.DECIMAL(10,2),
      allowNull     : false,
      defaultValue  : '0.00',
      comment       : "Longest Bid Winner Percent (only if different)"
    },

    minPlayersRequiredToStart: {
      field           : 'min_players_required_to_start',
      type            : DataTypes.INTEGER(11),
      allowNull       : false,
      defaultValue    : 1,
      comment         : "Minium Players required to start the game"
    },

    minWinsToUnlockNextLevel: {
      field           : 'min_wins_to_unlock_next_level',
      type            : DataTypes.INTEGER(11),
      allowNull       : false,
      defaultValue    : 1,
      comment         : "Minumum wins to unlock the next level"
    },

    isLastLevel : {
      field         : "is_last_level",
      type          : DataTypes.BOOLEAN,
      defaultValue  : 0,
      comment       : "Is this last level"
    }
  },
  {
    freezeTableName   : true,
    tableName         : 'jackpot_battle_level',

    classMethods:{
      associate:function(models)
      {
        JackpotBattleLevel.belongsTo(models.Jackpot, {
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

  return JackpotBattleLevel;
};
