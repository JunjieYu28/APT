const express = require('express');
const rateLimit = require('express-rate-limit');
const Canvas = require('../models/Canvas');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Rate limiter
const canvasLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Get all canvases for the current user
router.get('/', authMiddleware, canvasLimiter, async (req, res) => {
  try {
    const canvases = await Canvas.find({ owner: req.userId })
      .sort({ updatedAt: -1 })
      .select('-drawingData');

    res.json({ canvases });
  } catch (error) {
    console.error('Get canvases error:', error);
    res.status(500).json({ error: 'Failed to get canvases' });
  }
});

// Get a specific canvas by ID
router.get('/:id', authMiddleware, canvasLimiter, async (req, res) => {
  try {
    const canvas = await Canvas.findOne({
      _id: req.params.id,
      owner: req.userId
    });

    if (!canvas) {
      return res.status(404).json({ error: 'Canvas not found' });
    }

    res.json({ canvas });
  } catch (error) {
    console.error('Get canvas error:', error);
    res.status(500).json({ error: 'Failed to get canvas' });
  }
});

// Create a new canvas
router.post('/', authMiddleware, canvasLimiter, async (req, res) => {
  try {
    const { name, theme } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Canvas name is required' });
    }

    const canvas = new Canvas({
      name,
      theme: theme || 'default',
      owner: req.userId
    });

    await canvas.save();

    res.status(201).json({ canvas });
  } catch (error) {
    console.error('Create canvas error:', error);
    res.status(500).json({ error: 'Failed to create canvas' });
  }
});

// Update a canvas
router.put('/:id', authMiddleware, canvasLimiter, async (req, res) => {
  try {
    const { name, theme, drawingData, thumbnail } = req.body;

    const canvas = await Canvas.findOne({
      _id: req.params.id,
      owner: req.userId
    });

    if (!canvas) {
      return res.status(404).json({ error: 'Canvas not found' });
    }

    if (name !== undefined) canvas.name = name;
    if (theme !== undefined) canvas.theme = theme;
    if (drawingData !== undefined) canvas.drawingData = drawingData;
    if (thumbnail !== undefined) canvas.thumbnail = thumbnail;

    await canvas.save();

    res.json({ canvas });
  } catch (error) {
    console.error('Update canvas error:', error);
    res.status(500).json({ error: 'Failed to update canvas' });
  }
});

// Delete a canvas
router.delete('/:id', authMiddleware, canvasLimiter, async (req, res) => {
  try {
    const canvas = await Canvas.findOneAndDelete({
      _id: req.params.id,
      owner: req.userId
    });

    if (!canvas) {
      return res.status(404).json({ error: 'Canvas not found' });
    }

    res.json({ message: 'Canvas deleted successfully' });
  } catch (error) {
    console.error('Delete canvas error:', error);
    res.status(500).json({ error: 'Failed to delete canvas' });
  }
});

module.exports = router;
