'use strict';

module.exports = function(sequelize, DataTypes)
{
  var Link = sequelize.define('Link', {
    id: {
      type            : DataTypes.INTEGER(11),
      allowNull       : false,
      primaryKey      : true,
      autoIncrement   : true,
      comment         : "Primary and auto increment key of the table"
    },

    parentId : {
      field       : "parent_id",
      type        : DataTypes.INTEGER(5),
      allowNull   : false,
      comment     : "Link Parent ID"
    },

    linkOrder: {
      field       : "link_order",
      type        : DataTypes.INTEGER(5),
      allowNull   : true,
      comment     : "Link Order"
    },

    name: {
      field       : "name",
      type        : DataTypes.STRING(255),
      allowNull   : false,
      comment     : "Link Name"
    },

    alias: {
      field       : "alias",
      type        : DataTypes.STRING(255),
      allowNull   : false,
      comment     : "Link Alias"
    },

    icon: {
      field       : "icon",
      type        : DataTypes.STRING(100),
      allowNull   : true,
      comment     : "Link Icon"
    },

    href: {
      field       : "href",
      type        : DataTypes.STRING(255),
      allowNull   : true,
      comment     : "Link HREF"
    },

    actions: {
      field       : "actions",
      type        : DataTypes.TEXT,
      allowNull   : false,
      comment     : "Link Actions"
    },

    status : {
      field         : "status",
      type          : DataTypes.ENUM('ACTIVE','INACTIVE'),
      allowNull     : false,
      defaultValue  : 'ACTIVE',
      comment       : "Link is active, inactive or deleted"
    }
  },
  {
    freezeTableName   : true,
    tableName         : 'link',

    classMethods:{
      associate:function(models){
        Link.belongsTo(models.LinkCategory, {
          as          : 'LinkCategory',
          constraints : true,
          foreignKey  : {
            name      : 'linkCategoryId',
            field     : 'link_category_id',
            allowNull : false
          }
        });

        Link.hasMany(models.LinkPermission, {
          as          : 'LinkPermissions',
          constraints : true,
          foreignKey  : {
            name      : 'linkId',
            field     : 'link_id',
            allowNull : false
          }
        });
      }
    },
    defaultScope: {},
    scopes: {
    }
  });

  return Link;
};
