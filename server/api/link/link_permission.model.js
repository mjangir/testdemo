'use strict';

module.exports = function(sequelize, DataTypes)
{
  var LinkPermission = sequelize.define('LinkPermission', {
    id: {
      type            : DataTypes.INTEGER(11),
      allowNull       : false,
      primaryKey      : true,
      autoIncrement   : true,
      comment         : "Primary and auto increment key of the table"
    },

    permissions : {
      field       : "permissions",
      type        : DataTypes.TEXT,
      allowNull   : false,
      comment     : "Link Permissions"
    }
  },
  {
    freezeTableName   : true,
    tableName         : 'link_permission',

    classMethods:{
      associate:function(models){
        LinkPermission.belongsTo(models.Link, {
          as          : 'Link',
          constraints : true,
          foreignKey  : {
            name      : 'linkId',
            field     : 'link_id',
            allowNull : false
          }
        });

        LinkPermission.belongsTo(models.UserGroup, {
          as          : 'UserGroup',
          constraints : true,
          foreignKey  : {
            name      : 'groupId',
            field     : 'group_id',
            allowNull : false
          }
        });
      }
    },
    defaultScope: {},
    scopes: {
    }
  });

  return LinkPermission;
};
