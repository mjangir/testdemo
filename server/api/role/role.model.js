'use strict';

module.exports = function(sequelize, DataTypes)
{
  var Role = sequelize.define('Role', {
    id: {
      type            : DataTypes.INTEGER(11),
      allowNull       : false,
      primaryKey      : true,
      autoIncrement   : true,
      comment         : "Primary and auto increment key of the table"
    },

    role : {
      field       : "role",
      type        : DataTypes.STRING(255),
      allowNull   : false,
      comment     : "Role Name"
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
    tableName         : 'role',

    classMethods:{
      associate:function(models){
        Role.hasMany(models.UserGroup, {
          as          : 'UserGroups',
          constraints : true,
          foreignKey  : {
            name      : 'roleId',
            field     : 'role_id',
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

  return Role;
};
