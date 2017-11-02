'use strict';

module.exports = function(sequelize, DataTypes)
{
  var UserWinningMoneyStatement = sequelize.define('UserWinningMoneyStatement', {
    id: {
      type            : DataTypes.INTEGER(11),
      allowNull       : false,
      primaryKey      : true,
      autoIncrement   : true,
      comment         : "Primary and auto increment key of the table"
    },

    credit : {
      field       : "credit",
      type        : DataTypes.DECIMAL(10,2),
      allowNull   : true,
      defaultValue: 0,
      comment     : "Credit Amount"
    },

    debit : {
      field       : "debit",
      type        : DataTypes.DECIMAL(10,2),
      allowNull   : true,
      defaultValue: 0,
      comment     : "Debit Amount"
    },

    relatedTo: {
      field         : "related_to",
      type          : DataTypes.ENUM('JACKPOT','BATTLE'),
      allowNull     : false,
      defaultValue  : 'JACKPOT',
      comment       : "Related To"
    }
  },
  {
    freezeTableName   : true,
    tableName         : 'user_winning_money_statement',

    classMethods:{
      associate:function(models)
      {
        UserWinningMoneyStatement.belongsTo(models.User, {
          as          : 'User',
          constraints : true,
          foreignKey  : {
            name      : 'userId',
            field     : 'user_id',
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

  return UserWinningMoneyStatement;
};
