'use strict';

import express from 'express';
import passport from 'passport';
import config from '../config/environment';
import {User} from '../sqldb';
import localRoute from './local/index';
import localLogout from './local/logout';
import registerRoute from './register';
import facebookRoute from './facebook';
import {setup as localPassportSetup} from './local/passport';
import {setup as facebookPassportSetup} from './facebook/passport';
import auth from './auth.service';


// Passport Configuration
localPassportSetup(User, config);
facebookPassportSetup(User, config);

const router = express.Router();

router.use('/login', localRoute);
router.use('/logout', [auth.isAuthenticated()], localLogout);
router.use('/facebook', facebookRoute);
router.use('/register', registerRoute);

export default router;
