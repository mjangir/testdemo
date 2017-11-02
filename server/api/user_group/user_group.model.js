'use strict';

module.exports = function(sequelize, DataTypes)
{
  var UserGroup = sequelize.define('UserGroup', {
    id: {
      type            : DataTypes.INTEGER(11),
      allowNull       : false,
      primaryKey      : true,
      autoIncrement   : true,
      comment         : "Primary and auto increment key of the table"
    },

    groupName : {
      field       : "group_name",
      type        : DataTypes.STRING(255),
      allowNull   : false,
      comment     : "Group Name"
    },

    alias: {
      field       : "alias",
      type        : DataTypes.STRING(255),
      allowNull   : false,
      comment     : "Group Alias"
    },

    description: {
      field         : "description",
      type          : DataTypes.TEXT,
      allowNull     : true,
      comment       : "Group Name Description"
    },

    status: {
      field         : "status",
      type          : DataTypes.ENUM('ACTIVE','INACTIVE'),
      allowNull     : false,
      defaultValue  : 'ACTIVE',
      comment       : "Weather a Role is active, inactive or deleted"
    },
  },
  {
    freezeTableName   : true,
    tableName         : 'user_group',

    classMethods:{
      associate:function(models){
        UserGroup.belongsTo(models.Role, {
          as          : 'Role',
          constraints : true,
          foreignKey  : {
            name      : 'roleId',
            field     : 'role_id',
            allowNull : false
          }
        });

        UserGroup.hasMany(models.User, {
          as          : 'Users',
          constraints : true,
          foreignKey  : {
            name      : 'userGroupId',
            field     : 'user_group_id',
            allowNull : false
          }
        });
      }
    },
    defaultScope: {
      where: {
        status: 'ACTIVE'
      }
    },
    scopes: {
    }
  });

  return UserGroup;
};
