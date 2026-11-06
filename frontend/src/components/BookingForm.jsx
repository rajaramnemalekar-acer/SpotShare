import React, { useState } from 'react';
import axios from 'axios';

const BookingForm = ({ listingId, pricePerHour }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Get current date-time string in format required by datetime-local (YYYY-MM-THH:mm)
  const getCurrentDateTimeMin = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const handleStartDateChange = (e) => {
    const selectedStart = e.target.value;
    setStartDate(selectedStart);
    setSuccessMsg('');

    if (endDate && new Date(selectedStart) >= new Date(endDate)) {
      // Automatically push end date to 1 hour after new start date or reset it
      setEndDate('');
      setErrorMsg("⚠️ Start Date changed. End Date reset — please pick an End Date after the Start Date.");
    } else {
      setErrorMsg('');
    }
  };

  const handleEndDateChange = (e) => {
    const selectedEnd = e.target.value;
    setSuccessMsg('');

    if (startDate && new Date(selectedEnd) <= new Date(startDate)) {
      setErrorMsg("❌ Error: End Date & Time must be strictly after Start Date & Time.");
      setEndDate(''); // Block saving invalid end date into state
      return;
    }

    setErrorMsg('');
    setEndDate(selectedEnd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!startDate || !endDate) {
      setErrorMsg("❌ Please select both Start and End dates.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      setErrorMsg("❌ Error: End Date & Time must be strictly after Start Date & Time.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.post(
        'http://localhost:5000/api/bookings',
        { listingId, startDate, endDate },
        { headers: { Authorization: token ? `Bearer ${token}` : '' } }
      );

      if (response.data.success) {
        setSuccessMsg("✅ Booking reserved successfully!");
        setStartDate('');
        setEndDate('');
      }
    } catch (err) {
      const serverMessage = err.response?.data?.message || "Failed to complete booking.";
      setErrorMsg(`❌ ${serverMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-800 text-white rounded-xl shadow-md max-w-md mx-auto">
      <h3 className="text-xl font-bold mb-4">Book This Spot</h3>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-600 text-white text-sm font-semibold rounded-lg flex items-center gap-2">
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 bg-green-600 text-white text-sm font-semibold rounded-lg flex items-center gap-2">
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">Start Date & Time</label>
          <input
            type="datetime-local"
            value={startDate}
            min={getCurrentDateTimeMin()}
            onChange={handleStartDateChange}
            className="p-3 bg-gray-700 rounded-lg text-white border border-gray-600 focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold">End Date & Time</label>
          <input
            type="datetime-local"
            value={endDate}
            min={startDate || getCurrentDateTimeMin()}
            onChange={handleEndDateChange}
            className="p-3 bg-gray-700 rounded-lg text-white border border-gray-600 focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 font-bold rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Processing..." : "Reserve Spot"}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;