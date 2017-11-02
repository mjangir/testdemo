'use strict';

import express from 'express';
import controller from './jackpot.controller';
import * as validators from './jackpot.validations';
import auth from '../../auth/auth.service';

// Create router object
const router = express.Router();

// Get all jackpots
router.get('/', [auth.isAuthenticated(), validators.index], controller.index);

// Get a single jackpot
router.get('/:id', [auth.isAuthenticated(), validators.show], controller.show);

// Create a new jackpot
router.post('/', [auth.isAuthenticated(), validators.create], controller.create);

// Update a jackpot using PUT
router.put('/:id', [auth.isAuthenticated(), validators.update], controller.update);

// Update a jackpot using PATCH
router.patch('/:id', [auth.isAuthenticated(), validators.update], controller.update);

// Delete a jackpot
router.delete('/:id', [auth.isAuthenticated(), validators.destroy], controller.destroy);

// Insert a jackpot in global state
router.post('/insert-in-socket/:id', [auth.isAuthenticated()], controller.insertInSocket);

// Update a jackpot in global state
router.post('/update-in-socket/:id', [auth.isAuthenticated()], controller.updateInSocket);

// Update jackpot battle levels in socket
router.post('/update-battle-in-socket/:id', [auth.isAuthenticated()], controller.updateBattleInSocket);

// Update a jackpot in global state
router.post('/check-socket-game-state/:id', [auth.isAuthenticated()], controller.checkSocketGameState);

//Export the router
module.exports = router;
