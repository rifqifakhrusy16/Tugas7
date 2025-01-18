const express = require('express');
const GameCartridgeController = require('../controllers/gameCartridgeController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Routes for game cartridge CRUD operations
router.post('/', authMiddleware, GameCartridgeController.createGameCartridge);
router.get('/', GameCartridgeController.getGameCartridges);
router.get('/:id', GameCartridgeController.getGameCartridgeById);
router.put('/:id', authMiddleware, GameCartridgeController.updateGameCartridgeById);
router.delete('/:id', authMiddleware, GameCartridgeController.deleteGameCartridgeById);

module.exports = router;
