'use strict';

import {generateRandomString} from '../utils/functions';
import { User, Jackpot } from '../sqldb';

// Seed User Table

User.bulkCreate([{
  name: 'Ticktock Admin',
  email: 'admin@admin.com',
  password: 'password'
},
{
  name: 'Manish Jangir',
  email: 'manish@ticktock.com',
  password: 'password'
},
{
  name: 'Viral Solani',
  email: 'viral@ticktock.com',
  password: 'password'
},
{
  name: 'Neeraj Jani',
  email: 'neeraj@ticktock.com',
  password: 'password'
},
{
  name: 'Kevin',
  email: 'kevin@ticktock.com',
  password: 'password'
},
{
  name: 'Anuj',
  email: 'anuj@ticktock.com',
  password: 'password'
},
{
  name: 'Saransh',
  email: 'saransh@ticktock.com',
  password: 'password'
}
]);

Jackpot.bulkCreate([{
  title: 'First Jackpot',
  amount: 50000,
  gameClockTime: 320,
  doomsDayTime: 3600,
  gameClockRemaining: 320,
  doomsDayRemaining: 3600,
  uniqueId: generateRandomString(20, 'aA'),
  gameStatus: 'NOT_STARTED',
  createdBy: 1
},
{
  title: 'Second Jackpot',
  amount: 30000,
  gameClockTime: 120,
  doomsDayTime: 1200,
  gameClockRemaining: 120,
  doomsDayRemaining: 1200,
  uniqueId: generateRandomString(20, 'aA'),
  gameStatus: 'NOT_STARTED',
  createdBy: 1
}
]);