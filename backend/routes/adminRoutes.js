import express from 'express';
import Booking from '../models/Booking.js';
import Listing from '../models/Listing.js';
import User from '../models/User.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Get Admin Analytics & All Activities
router.get('/stats', verifyToken, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalListings = await Listing.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const bookings = await Booking.find().populate('listing').populate('user', 'name email').sort({ createdAt: -1 });
    const listings = await Listing.find().sort({ createdAt: -1 });

    res.json({ totalUsers, totalListings, totalBookings, bookings, listings });
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching admin stats' });
  }
});

// Delete any listing as Admin
router.delete('/listings/:id', verifyToken, adminOnly, async (err, req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: 'Listing deleted by admin' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting listing' });
  }
});

export default router;