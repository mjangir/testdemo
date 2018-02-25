'use strict';

import express from 'express';
import controller from './leaderboard.controller';
import * as validators from './leaderboard.validations';
import auth from '../../auth/auth.service';

const router = express.Router();

router.get('/', [auth.isAuthenticated(), validators.index], controller.index);

export default router;
