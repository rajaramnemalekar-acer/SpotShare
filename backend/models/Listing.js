import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  pricePerHour: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Listing', listingSchema);