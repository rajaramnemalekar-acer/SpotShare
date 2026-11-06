import express from 'express';
import Booking from '../models/Booking.js';
import Listing from '../models/Listing.js';
import { protect } from '../middleware/authMiddleware.js';
import { sendBrevoEmail } from '../utils/sendEmail.js';

const router = express.Router();

// Create Booking with Server-Side Price Calculation & Non-Blocking Brevo Email Notification
router.post('/', protect, async (req, res) => {
  try {
    const { listingId, startTime, endTime, paymentMethod } = req.body;
    
    if (!listingId || !startTime || !endTime) {
      return res.status(400).json({ message: 'Please provide all required booking details.' });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found.' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      return res.status(400).json({ message: 'End time must be after start time.' });
    }

    // Calculate hourly rate + $10 service fee
    const hours = Math.max(1, Math.abs(end - start) / 36e5);
    const totalPrice = Math.round(hours * listing.pricePerHour) + 10;

    // 1. Create booking in MongoDB
    const booking = await Booking.create({
      user: req.user._id,
      listing: listingId,
      startTime: start,
      endTime: end,
      totalPrice,
      paymentMethod: paymentMethod || 'stripe',
      paymentStatus: 'Paid',
      status: 'Confirmed'
    });

    const populatedBooking = await Booking.findById(booking._id).populate('listing');

    // 2. Trigger Brevo Email in background (errors here will not block or crash booking creation)
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #0f172a; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #ff385c; margin-top: 0;">SpotShare Booking Confirmed!</h2>
          <p>Hi <strong>${req.user.name}</strong>,</p>
          <p>Your space reservation has been successfully booked!</p>
          
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Space:</strong> ${listing.title}</p>
            <p style="margin: 5px 0;"><strong>Location:</strong> ${listing.location}</p>
            <p style="margin: 5px 0;"><strong>Start Time:</strong> ${start.toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>End Time:</strong> ${end.toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Total Paid:</strong> $${totalPrice}.00 via ${(paymentMethod || 'stripe').toUpperCase()}</p>
          </div>

          <p>You can manage your reservations anytime from your SpotShare Dashboard.</p>
          <p style="margin-bottom: 0;">Thank you for choosing <strong>SpotShare</strong>!</p>
        </div>
      `;

      await sendBrevoEmail({
        toEmail: req.user.email,
        toName: req.user.name,
        subject: `Booking Confirmed: ${listing.title} on SpotShare`,
        htmlContent: emailHtml,
      });
    } catch (emailErr) {
      console.error('Email sending background error:', emailErr.message);
    }

    // 3. Always return success to frontend
    res.status(201).json({ message: 'Booking confirmed successfully', booking: populatedBooking });
  } catch (err) {
    console.error('Booking server error:', err);
    res.status(500).json({ message: 'Server error during booking', error: err.message });
  }
});

// Get User Bookings
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate('listing').sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user bookings', error: err.message });
  }
});

// Cancel Booking & Send Cancellation Email
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('listing');
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    booking.status = 'Cancelled';
    await booking.save();

    // Trigger Cancellation Email in background
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #0f172a; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #dc2626; margin-top: 0;">SpotShare Booking Cancelled</h2>
          <p>Hi <strong>${req.user.name}</strong>,</p>
          <p>Your space reservation has been successfully cancelled.</p>
          
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Space:</strong> ${booking.listing?.title || 'Space Listing'}</p>
            <p style="margin: 5px 0;"><strong>Location:</strong> ${booking.listing?.location || 'Sindhudurg'}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">Cancelled</span></p>
          </div>

          <p>If you have any questions or did this by mistake, feel free to book again anytime.</p>
          <p style="margin-bottom: 0;">Thank you for using <strong>SpotShare</strong>!</p>
        </div>
      `;

      await sendBrevoEmail({
        toEmail: req.user.email,
        toName: req.user.name,
        subject: `Booking Cancelled: ${booking.listing?.title || 'Space'} on SpotShare`,
        htmlContent: emailHtml,
      });
    } catch (emailErr) {
      console.error('Cancellation email background error:', emailErr.message);
    }

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (err) {
    console.error('Error cancelling booking:', err.message);
    res.status(500).json({ message: 'Error cancelling booking', error: err.message });
  }
});

export default router;