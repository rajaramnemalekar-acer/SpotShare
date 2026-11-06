import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/listings')
      .then(res => setListings(res.data))
      .catch(err => console.error('Error fetching listings:', err));
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Find unique spaces by the hour</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        {listings.map(listing => (
          <div key={listing._id} style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
            <img src={listing.imageUrl} alt={listing.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
            <div style={{ padding: '1rem' }}>
              <h3>{listing.title}</h3>
              <p style={{ color: '#666' }}>{listing.location}</p>
              <p style={{ fontWeight: 'bold', marginTop: '0.5rem' }}>${listing.pricePerHour} / hour</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}