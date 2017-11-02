'use strict';

module.exports = function(sequelize, DataTypes)
{
  var Country = sequelize.define('Country', {
    id: {
      type            : DataTypes.INTEGER(11),
      allowNull       : false,
      primaryKey      : true,
      autoIncrement   : true,
      comment         : "Primary and auto increment key of the table"
    },

    countryName : {
      field       : "country_name",
      type        : DataTypes.STRING(100),
      allowNull   : false,
      comment     : "Country Name"
    },

    countryCode: {
      field       : "country_code",
      type        : DataTypes.STRING(10),
      allowNull   : false,
      comment     : "Country Code"
    }
  },
  {
    freezeTableName   : true,
    tableName         : 'country',

    classMethods:{
      associate:function(models){
      }
    },
    defaultScope: {},
    scopes: {
    }
  });

  return Country;
};
