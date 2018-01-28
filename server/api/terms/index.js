'use strict';

import express from 'express';
import controller from './terms.controller';
import sharp from 'sharp';

const router = express.Router();

router.get('/', controller.index);

export default router;
