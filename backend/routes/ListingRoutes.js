import express from 'express';
import Listing from '../models/Listing.js';

const router = express.Router();

// GET /api/listings - Fetch all listings
router.get('/', async (req, res) => {
  try {
    const listings = await Listing.find({});
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching listings', error: err.message });
  }
});

// GET /api/listings/:id - Fetch single listing by ID
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching listing details', error: err.message });
  }
});

export default router;