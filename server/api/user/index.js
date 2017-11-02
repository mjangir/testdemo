'use strict';

import express from 'express';
import controller from './user.controller';
import * as validators from './user.validations';
import auth from '../../auth/auth.service';

const router = express.Router();

// Get all users
router.get('/', [auth.isAuthenticated(), validators.index], controller.index);

// Get a single user
router.get('/:id', [auth.isAuthenticated(), validators.show], controller.show);

// Create a new user
router.post('/', [auth.isAuthenticated(), validators.create], controller.create);

// Update a user using PUT
router.put('/:id', [auth.isAuthenticated(), validators.update], controller.update);

// Update a user using PATCH
router.patch('/:id', [auth.isAuthenticated(), validators.update], controller.update);

// Delete a user
router.delete('/:id', [auth.isAuthenticated(), validators.destroy], controller.destroy);

export default router;
