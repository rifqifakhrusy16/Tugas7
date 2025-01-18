const GameCartridge = require('../models/gameCartridge');
const Todo = require('../models/todo');

class GameCartridgeController {
  async createGameCartridge(req, res) {
    const { name, price, type } = req.body;
    const userId = req.user.id;

    try {
      const newGameCartridge = new GameCartridge({
        name,
        price,
        type,
        userId,
      });
      await newGameCartridge.save();
      res.status(201).json({ message: 'Game cartridge created successfully', data: newGameCartridge });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  async getGameCartridges(req, res) {
    try {
      const gameCartridges = await GameCartridge.find();
      res.status(200).json({ data: gameCartridges });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  async getGameCartridgeById(req, res) {
    const { id } = req.params;
    try {
      const gameCartridge = await GameCartridge.findById(id);
      if (!gameCartridge) {
        return res.status(404).json({ message: 'Game cartridge not found' });
      }
      res.status(200).json({ data: gameCartridge });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  async updateGameCartridgeById(req, res) {
    const { id } = req.params;
    const { name, price, type } = req.body;

    try {
      const updatedGameCartridge = await GameCartridge.findByIdAndUpdate(
        id,
        { name, price, type },
        { new: true }
      );
      if (!updatedGameCartridge) {
        return res.status(404).json({ message: 'Game cartridge not found' });
      }
      res.status(200).json({ message: 'Game cartridge updated successfully', data: updatedGameCartridge });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  async deleteGameCartridgeById(req, res) {
    const { id } = req.params;
    try {
      const deletedGameCartridge = await GameCartridge.findByIdAndDelete(id);
      if (!deletedGameCartridge) {
        return res.status(404).json({ message: 'Game cartridge not found' });
      }
      res.status(200).json({ message: 'Game cartridge deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

module.exports = new GameCartridgeController();
