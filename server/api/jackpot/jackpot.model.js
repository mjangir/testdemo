'use strict';

module.exports = function(sequelize, DataTypes)
{
  var Jackpot = sequelize.define('Jackpot', {
    id: {
      type            : DataTypes.INTEGER(11),
      allowNull       : false,
      primaryKey      : true,
      autoIncrement   : true,
      comment         : "Primary and auto increment key of the table"
    },

    title : {
      field       : "title",
      type        : DataTypes.STRING(255),
      allowNull   : false,
      comment     : "Jackpot Title"
    },

    amount : {
      field       : "amount",
      type        : DataTypes.DECIMAL(10,2),
      allowNull   : false,
      comment     : "Jackpot Winning Amount"
    },

    minPlayersRequired: {
      field         : "min_players_required",
      type          : DataTypes.INTEGER(11),
      allowNull     : false,
      defaultValue  : 1,
      comment       : "Minimum Players Required"
    },

    durationSetting: {
      field       : "duration_setting",
      type        : DataTypes.TEXT,
      allowNull   : true,
      comment     : "Duration Settings"
    },

    gameClockTime : {
      field         : "game_clock_time",
      type          : DataTypes.INTEGER(11),
      allowNull     : false,
      defaultValue  : 0,
      comment       : "Jackpot Game Clock Time (in seconds)"
    },

    doomsDayTime : {
      field         : "dooms_day_time",
      type          : DataTypes.INTEGER(11),
      allowNull     : false,
      defaultValue  : 0,
      comment       : "Jackpot Dooms Day Clock Time (in seconds)"
    },

    defaultAvailableBids: {
      field         : "default_available_bids",
      type          : DataTypes.INTEGER(11),
      allowNull     : false,
      defaultValue  : 10,
      comment       : "Default Available Bids"
    },

    increaseSecondsOnBid: {
      field         : "increase_seconds_on_bid",
      type          : DataTypes.INTEGER(11),
      allowNull     : false,
      defaultValue  : 10,
      comment       : "Increase Seconds On Bid"
    },

    increaseAmountSeconds : {
      field         : "increase_amount_seconds",
      type          : DataTypes.INTEGER(11),
      allowNull     : true,
      defaultValue  : null,
      comment       : "Increase Amount Seconds"
    },

    increaseAmount : {
      field         : "increase_amount",
      type          : DataTypes.DECIMAL(10,2),
      allowNull     : true,
      defaultValue  : null,
      comment       : "Increase Amount"
    },

    gameClockRemaining : {
      field         : "game_clock_remaining",
      type          : DataTypes.INTEGER(11),
      allowNull     : false,
      defaultValue  : 0,
      comment       : "Jackpot Game Clock Remaining Time (in seconds)"
    },

    doomsDayRemaining : {
      field         : "dooms_day_remaining",
      type          : DataTypes.INTEGER(11),
      allowNull     : false,
      defaultValue  : 0,
      comment       : "Jackpot Dooms Day Remaining Clock Time (in seconds)"
    },

    gameStatus: {
      field         : "game_status",
      type          : DataTypes.ENUM('NOT_STARTED','STARTED', 'FINISHED'),
      allowNull     : false,
      defaultValue  : 'NOT_STARTED',
      comment       : "Jackpot game status"
    },

    uniqueId  : {
      field       : "unique_id",
      type        : DataTypes.STRING(32),
      allowNull   : false,
      comment     : "Jackpot Unique ID"
    },

    startedOn : {
      field         : "started_on",
      type          : DataTypes.DATE,
      allowNull     : true,
      comment       : "It will have datetime as soon as the game status goes to STARTED"
    },

    status: {
      field         : "status",
      type          : DataTypes.ENUM('ACTIVE','INACTIVE'),
      allowNull     : false,
      defaultValue  : 'ACTIVE',
      comment       : "Weather a Jackpot is active, inactive or deleted"
    },
  },
  {
    freezeTableName   : true,
    tableName         : 'jackpot',

    classMethods:{
      associate:function(models){
        Jackpot.belongsTo(models.User, {
          as          : 'CreatedByUser',
          constraints : true,
          foreignKey  : {
            name      : 'createdBy',
            field     : 'created_by',
            allowNull : true
          }
        });

        Jackpot.belongsTo(models.User, {
          as          : 'UpdatedByUser',
          constraints : true,
          foreignKey  : {
            name      : 'updatedBy',
            field     : 'updated_by',
            allowNull : true
          }
        });

        Jackpot.hasMany(models.JackpotGame, {
          as          : 'JackpotGames',
          constraints : true,
          foreignKey  : {
            name      : 'jackpotId',
            field     : 'jackpot_id',
            allowNull : false
          }
        });

        Jackpot.hasMany(models.JackpotBattleLevel, {
          as          : 'JackpotBattleLevels',
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
      started: {
        where: {
          status: 'STARTED'
        }
      }
    }
  });

  return Jackpot;
};
