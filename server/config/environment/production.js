'use strict';

module.exports = {
  ip:     process.env.OPENSHIFT_NODEJS_IP ||
          process.env.IP ||
          undefined,
  port:   process.env.OPENSHIFT_NODEJS_PORT ||
          process.env.PORT ||
          8080,
  seedDB    : false,
  errors    : {
    enable  : false
  },
  sequelize : {
    database  : 'ticktock',
    username  : 'root',
    password  : 'root',
    host      : 'localhost',
    logging   : true,
    options   : {
      logging : false,
      dialect : 'mysql',
      port    : 3306,
      pool    : {
        maxConnections: 20,
        maxIdleTime: 30000
      },
      replication : {
        read : {
          host      : 'localhost',
          username  : 'root',
          password  : 'root'
        },
        write : {
          host      : 'localhost',
          username  : 'root',
          password  : 'root'
        }
      },
      define: {
        timestamps  : true,
        createdAt   : 'created_at',
        updatedAt   : 'updated_at'
      }
    }
  }
};
