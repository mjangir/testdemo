'use strict';

import express from 'express';
import controller from './settings.controller';
import * as validators from './settings.validations';
import auth from '../../auth/auth.service';

// Create router object
const router = express.Router();

// Get all settings
router.get('/', [auth.isAuthenticated(), validators.index], controller.index);

// Get a single setting
router.get('/:id', [auth.isAuthenticated(), validators.show], controller.show);

// Create a new setting
router.post('/', [auth.isAuthenticated(), validators.create], controller.create);

// Update a setting using PUT
router.put('/:id', [auth.isAuthenticated(), validators.update], controller.update);

// Update a setting using PATCH
router.patch('/:id', [auth.isAuthenticated(), validators.update], controller.update);

// Delete a setting
router.delete('/:id', [auth.isAuthenticated(), validators.destroy], controller.destroy);

// Update global settings
router.post('/update-global-settings', [auth.isAuthenticated()], controller.updateGlobalSettingsVar);

//Export the router
module.exports = router;
