'use strict';

module.exports = function(sequelize, DataTypes)
{
  var LinkCategory = sequelize.define('LinkCategory', {
    id: {
      type            : DataTypes.INTEGER(11),
      allowNull       : false,
      primaryKey      : true,
      autoIncrement   : true,
      comment         : "Primary and auto increment key of the table"
    },

    name : {
      field       : "name",
      type        : DataTypes.STRING(255),
      allowNull   : false,
      comment     : "Link Category Name"
    },

    alias: {
      field       : "alias",
      type        : DataTypes.STRING(255),
      allowNull   : false,
      comment     : "Link Category Alias"
    },
  },
  {
    freezeTableName   : true,
    tableName         : 'link_category',

    classMethods:{
      associate:function(models){
        LinkCategory.belongsTo(models.Role, {
          as          : 'Role',
          constraints : true,
          foreignKey  : {
            name      : 'roleId',
            field     : 'role_id',
            allowNull : false
          }
        });

        LinkCategory.hasMany(models.Link, {
          as          : 'Links',
          constraints : true,
          foreignKey  : {
            name      : 'linkCategoryId',
            field     : 'link_category_id',
            allowNull : false
          }
        });
      }
    },
    defaultScope: {},
    scopes: {
    }
  });

  return LinkCategory;
};
