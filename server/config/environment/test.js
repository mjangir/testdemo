export default {
  ip        : process.env.IP || '0.0.0.0',
  port      : process.env.PORT || 9000,
  seedDB    : true,
  errors    : {
    enable  : true
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