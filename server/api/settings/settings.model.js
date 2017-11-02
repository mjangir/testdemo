'use strict';

module.exports = function(sequelize, DataTypes)
{
  var Settings = sequelize.define('Settings', {
    id: {
      type            : DataTypes.INTEGER(11),
      allowNull       : false,
      primaryKey      : true,
      autoIncrement   : true,
      comment         : "Primary and auto increment key of the table"
    },

    key : {
      field       : "key",
      type        : DataTypes.STRING(255),
      allowNull   : false,
      comment     : "Setting Key"
    },

    value : {
      field       : "value",
      type        : DataTypes.TEXT('long'),
      allowNull   : true,
      comment     : "Setting Value"
    }
  },
  {
    freezeTableName   : true,
    tableName         : 'setting',

    classMethods:{
      associate:function(models){
        
      },

      findAllSettingsAsJson: function(callback)
      {
        Settings.findAll({raw: true})
        .then(function(entities)
        {
          var settings = {};
          if(entities.length > 0)
          {
            for(var k in entities)
            {
              settings[entities[k].key] = entities[k].value;
            }
          }
          callback(null, settings);
        })
        .catch(function(err)
        {
          callback(err);
        });
      }
    }
  });

  return Settings;
};
