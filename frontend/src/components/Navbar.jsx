import React from 'react';

export default function Navbar() {
  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem', borderBottom: '1px solid #ddd' }}>
      <h2>Spaces<span style={{ color: '#0066cc' }}>Clone</span></h2>
      <div>
        <button style={{ marginRight: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>Explore Spaces</button>
        <button style={{ background: '#ff385c', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>List Your Space</button>
      </div>
    </nav>
  );
}