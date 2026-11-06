import Booking from '../models/Booking.js';
import Listing from '../models/Listing.js';

export const createBooking = async (req, res) => {
  try {
    const { listingId, startDate, endDate, totalAmount } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // 1. Validate that dates are valid Date objects
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format provided."
      });
    }

    // 2. Validate date order (End date must be after Start date)
    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "End Date & Time must be strictly after Start Date & Time."
      });
    }

    // 3. Check for existing date conflict overlaps for this listing
    const conflictingBooking = await Booking.findOne({
      listingId,
      $or: [
        { startDate: { $lt: end }, endDate: { $gt: start } }
      ]
    });

    if (conflictingBooking) {
      return res.status(409).json({
        success: false,
        message: "This spot is already booked for the selected date and time range."
      });
    }

    // 4. Create and save the new booking
    const newBooking = new Booking({
      listingId,
      userId: req.user ? req.user.id : null,
      startDate: start,
      endDate: end,
      totalAmount
    });

    await newBooking.save();

    return res.status(201).json({
      success: true,
      message: "Booking created successfully!",
      booking: newBooking
    });

  } catch (error) {
    console.error("Error creating booking:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while processing booking.",
      error: error.message
    });
  }
};