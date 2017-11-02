'use strict';

import path from 'path';
import config from '../config/environment';
import Sequelize from 'sequelize';
import logger from '../utils/logger';

// Log SQL queries if logging is true
if(config.sequelize.logging === true)
{
  config.sequelize.options.logging = function(message)
  {
    logger.info(message);
  }
}

// Create new Sequelize connection instance
const sequelizeConnection = new Sequelize(config.sequelize.database, null, null, config.sequelize.options);

// Data for expose
const db = {
  Sequelize: Sequelize,
  sequelize: sequelizeConnection
};

// Import Sequelize models
db.Country              = db.sequelize.import('../api/country/country.model');
db.Role                 = db.sequelize.import('../api/role/role.model');
db.UserGroup            = db.sequelize.import('../api/user_group/user_group.model');
db.User                 = db.sequelize.import('../api/user/user.model');
db.Settings             = db.sequelize.import('../api/settings/settings.model');
db.LinkCategory         = db.sequelize.import('../api/link_category/link_category.model');
db.Link                 = db.sequelize.import('../api/link/link.model');
db.LinkPermission       = db.sequelize.import('../api/link/link_permission.model');
db.Jackpot              = db.sequelize.import('../api/jackpot/jackpot.model');
db.JackpotBattleLevel   = db.sequelize.import('../api/jackpot/jackpot-battle-level.model');
db.JackpotGame          = db.sequelize.import('../api/jackpot/jackpot-game.model');
db.JackpotGameUser      = db.sequelize.import('../api/jackpot/jackpot-game-user.model');
db.JackpotGameUserBid   = db.sequelize.import('../api/jackpot/jackpot-game-user-bid.model');
db.JackpotGameWinner    = db.sequelize.import('../api/jackpot/jackpot-game-winner.model');
db.UserWinningMoneyStatement = db.sequelize.import('../api/user/user-winning-money-statement.model');


// Model Associations for Sequelize
Object.keys(db).forEach(function(modelName)
{
  if(db[modelName].hasOwnProperty('associate'))
  {
    db[modelName].associate(db);
  }
});

export default db;
