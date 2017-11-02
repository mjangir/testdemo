'use strict';

module.exports = function(sequelize, DataTypes)
{
  var JackpotGameUserBid = sequelize.define('JackpotGameUserBid', {
    id: {
      type            : DataTypes.INTEGER(11),
      allowNull       : false,
      primaryKey      : true,
      autoIncrement   : true,
      comment         : "Primary and auto increment key of the table"
    },

    bidStartTime : {
      field         : "bid_start_time",
      type          : DataTypes.DATE,
      allowNull     : false,
      comment       : "Bid start time"
    },

    bidEndTime : {
      field         : "bid_end_time",
      type          : DataTypes.DATE,
      allowNull     : true,
      comment       : "Bid end time"
    },

    bidDuration : {
      field         : "bid_duration",
      type          : DataTypes.INTEGER(11),
      allowNull     : true,
      defaultValue  : 0,
      comment       : "Duration of bid in seconds"
    },
  },
  {
    freezeTableName   : true,
    tableName         : 'jackpot_game_user_bid',

    classMethods:{
      associate:function(models)
      {
        JackpotGameUserBid.belongsTo(models.JackpotGameUser, {
          as          : 'JackpotGameUser',
          constraints : true,
          foreignKey  : {
            name      : 'jackpotGameUserId',
            field     : 'jackpot_game_user_id',
            allowNull : false
          }
        });
      }
    }
  });

  return JackpotGameUserBid;
};
