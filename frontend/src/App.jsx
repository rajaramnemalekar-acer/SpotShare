import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function App() {
  const [view, setView] = useState('home'); 
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  const [listings, setListings] = useState([]);
  const [searchCity, setSearchCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedListing, setSelectedListing] = useState(null);

  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  
  const [checkoutForm, setCheckoutForm] = useState({
    email: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
    cardholderName: '',
    country: 'India'
  });

  const [toast, setToast] = useState({ message: '', type: '' });
  const [myBookings, setMyBookings] = useState([]);
  const [latestBooking, setLatestBooking] = useState(null);
  const [adminData, setAdminData] = useState({ totalUsers: 0, totalListings: 0, totalBookings: 0, bookings: [], listings: [] });
  
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', role: 'guest' });
  const [authError, setAuthError] = useState('');

  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, ''); 
    if (val.length > 16) val = val.slice(0, 16);
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCheckoutForm(prev => ({ ...prev, cardNumber: formatted }));
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.slice(0, 4);
    
    if (val.length >= 2) {
      let month = parseInt(val.slice(0, 2), 10);
      if (month > 12) {
        val = '12' + val.slice(2);
      } else if (month === 0) {
        val = '01' + val.slice(2);
      }
    }

    if (val.length >= 3) {
      val = val.slice(0, 2) + '/' + val.slice(2);
    }
    setCheckoutForm(prev => ({ ...prev, expiry: val }));
  };

  const handleCvcChange = (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.slice(0, 4);
    setCheckoutForm(prev => ({ ...prev, cvc: val }));
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => { setToast({ message: '', type: '' }); }, 3500);
  };

  useEffect(() => {
    if (view === 'home') document.title = 'SpotShare - Explore Spaces';
    else if (view === 'details') document.title = selectedListing ? `SpotShare - ${selectedListing.title}` : 'SpotShare - Checkout';
    else if (view === 'success') document.title = 'SpotShare - Order Confirmed!';
    else if (view === 'login') document.title = 'SpotShare - Login';
    else if (view === 'register') document.title = 'SpotShare - Sign Up';
    else if (view === 'dashboard') document.title = 'SpotShare - My Bookings';
    else if (view === 'admin') document.title = 'SpotShare - Admin Dashboard';
  }, [view, selectedListing]);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await axios.get(`${API_URL}/listings`);
      setListings(res.data);
    } catch (err) {
      console.error('Error fetching listings:', err);
    }
  };

  const fetchAdminStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdminData(res.data);
      setView('admin');
    } catch (err) {
      showToast('Unauthorized access', 'error');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!authForm.email || !authForm.password) {
      setAuthError('Please fill out all required fields.');
      return;
    }
    setAuthError('');
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email: authForm.email,
        password: authForm.password,
      });
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setView('home');
      setAuthForm({ name: '', email: '', password: '', role: 'guest' });
      showToast('Logged in successfully!', 'success');
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!authForm.name || !authForm.email || !authForm.password) {
      setAuthError('Please fill out all required fields.');
      return;
    }
    setAuthError('');
    try {
      const res = await axios.post(`${API_URL}/auth/register`, authForm);
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setView('home');
      setAuthForm({ name: '', email: '', password: '', role: 'guest' });
      showToast('Account created successfully!', 'success');
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleLogout = async () => {
    try {
      if (user?.email) {
        await axios.post(`${API_URL}/auth/logout`, { email: user.email });
      }
    } catch (err) {
      console.error('Logout notification error:', err);
    }
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setView('home');
    showToast('Logged out successfully.', 'success');
  };

  const fetchMyBookings = async () => {
    try {
      const res = await axios.get(`${API_URL}/bookings/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyBookings(res.data);
      setView('dashboard');
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  const calculateTotal = () => {
    if (!startTime || !endTime || !selectedListing) return 0;
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) return 0;
    const hours = Math.max(1, Math.abs(end - start) / 36e5);
    return Math.round(hours * selectedListing.pricePerHour);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!startTime || !endTime) {
      showToast('Please fill out Start and End Date & Time.', 'error');
      return;
    }
    if (new Date(endTime) <= new Date(startTime)) {
      showToast('End date must be strictly after start date', 'error');
      return;
    }
    if (!checkoutForm.email || !checkoutForm.email.includes('@')) {
      showToast('Please enter a valid contact email.', 'error');
      return;
    }
    if (paymentMethod === 'stripe') {
      const rawCard = checkoutForm.cardNumber.replace(/\s/g, '');
      if (rawCard.length < 16) {
        showToast('Please enter a valid 16-digit card number.', 'error');
        return;
      }
      if (checkoutForm.expiry.length < 5) {
        showToast('Please enter a valid expiration date (MM/YY).', 'error');
        return;
      }
      if (checkoutForm.cvc.length < 3) {
        showToast('Please enter a valid CVC code.', 'error');
        return;
      }
      if (!checkoutForm.cardholderName.trim()) {
        showToast('Please enter the cardholder name.', 'error');
        return;
      }
    }
    if (!token) {
      setAuthForm({ name: '', email: '', password: '', role: 'guest' });
      setAuthError('');
      setView('login');
      showToast('Please log in to book this space.', 'error');
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/bookings`, {
        listingId: selectedListing._id,
        startTime,
        endTime,
        totalPrice: calculateTotal() ? calculateTotal() + 10 : selectedListing.pricePerHour + 10,
        paymentMethod,
        email: checkoutForm.email
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setLatestBooking(res.data.booking);
      showToast(`Payment via ${paymentMethod.toUpperCase()} & Booking confirmed!`, 'success');
      setView('success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Booking failed', 'error');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await axios.put(`${API_URL}/bookings/${bookingId}/cancel`, { email: user?.email }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Booking cancelled successfully', 'success');
      
      setMyBookings(prev => 
        prev.map(b => b._id === bookingId ? { ...b, status: 'Cancelled' } : b)
      );
    } catch (err) {
      console.error('Cancel error:', err.response?.data || err.message);
      showToast(err.response?.data?.message || 'Failed to cancel booking', 'error');
    }
  };

  const filteredListings = listings.filter(item => {
    const matchesSearch = item.location.toLowerCase().includes(searchCity.toLowerCase()) ||
                          item.title.toLowerCase().includes(searchCity.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedCategory === 'All') return true;

    return item.category && item.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase();
  });

  return (
    <div className="app-wrapper">
      {toast.message && (
        <div className={`toast-notification ${toast.type}`}>
          <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', gap: '4px', overflowX: 'auto', padding: '10px 12px' }}>
        <div className="logo-container" onClick={() => { setView('home'); setStartTime(''); setEndTime(''); setSelectedCategory('All'); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <div className="logo-icon-wrapper" style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ff385c', borderRadius: '50%' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21.7C17.3 17 20 13 20 9a8 8 0 1 0-16 0c0 4 2.7 8 8 12.7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
          </div>
          <h2 className="logo-text" style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, whiteSpace: 'nowrap' }}>Spot<span>Share</span></h2>
        </div>

        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <button onClick={() => { setView('home'); setStartTime(''); setEndTime(''); }} className={`btn-secondary ${view === 'home' ? 'active-tab' : ''}`} style={{ padding: '6px 10px', fontSize: '12px', whiteSpace: 'nowrap' }}>
            Explore
          </button>
          {user ? (
            <>
              <button onClick={fetchMyBookings} className={`btn-secondary ${view === 'dashboard' ? 'active-tab' : ''}`} style={{ padding: '6px 10px', fontSize: '12px', whiteSpace: 'nowrap' }}>
                Bookings
              </button>
              {user.role === 'admin' && (
                <button onClick={fetchAdminStats} className={`btn-secondary ${view === 'admin' ? 'active-tab' : ''}`} style={{ padding: '6px 8px', fontSize: '12px', whiteSpace: 'nowrap' }}>
                  Admin
                </button>
              )}
              <button onClick={handleLogout} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '12px', whiteSpace: 'nowrap' }}>Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => { setAuthForm({ name: '', email: '', password: '', role: 'guest' }); setAuthError(''); setView('login'); }} className={`btn-secondary ${view === 'login' ? 'active-tab' : ''}`} style={{ padding: '6px 10px', fontSize: '12px', whiteSpace: 'nowrap' }}>
                Login
              </button>
              <button onClick={() => { setAuthForm({ name: '', email: '', password: '', role: 'guest' }); setAuthError(''); setView('register'); }} className={`btn-primary nav-btn-signup ${view === 'register' ? 'active-tab' : ''}`} style={{ padding: '6px 10px', fontSize: '12px', whiteSpace: 'nowrap' }}>
                Sign up
              </button>
            </>
          )}
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        {view === 'home' && (
          <div className="animated-page">
            <div className="hero-text-container">
              <h1>Find unique spaces by the hour</h1>
              <p>Book photo studios, production locations, meeting rooms, and event spaces near you.</p>
              <div className="search-input-wrapper">
                <input 
                  type="text" 
                  placeholder="Search by location (e.g. Malvan, Tarkarli, Amboli, Devgad)..." 
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            {/* CATEGORIES FILTER BAR */}
            <div className="categories-bar">
              {['All', 'Studio', 'Event', 'Meeting', 'Outdoor', 'Villa', 'Soundstage'].map(cat => (
                <div 
                  key={cat} 
                  className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </div>
              ))}
            </div>

            <div className="listings-grid-wrapper">
              <div className="listings-grid">
                {filteredListings.map(listing => (
                  <div key={listing._id} onClick={() => { setSelectedListing(listing); setStartTime(''); setEndTime(''); setView('details'); }} className="listing-card">
                    <img src={listing.imageUrl} alt={listing.title} className="listing-image" />
                    <div className="listing-card-body">
                      <h4>{listing.title}</h4>
                      <p className="listing-location">{listing.location}</p>
                      <p className="listing-price">
                        ${listing.pricePerHour} <span>/ hour</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STRIPE SPLIT CHECKOUT VIEW */}
        {view === 'details' && selectedListing && (
          <div className="animated-page">
            <div className="back-btn-wrapper">
               <button onClick={() => { setView('home'); setStartTime(''); setEndTime(''); }} className="btn-secondary">← Back to search</button>
            </div>

            <div className="checkout-split-container">
              <div className="checkout-left-pane">
                <p className="checkout-badge">SpotShare Secure Checkout</p>
                <h2 className="checkout-total">${calculateTotal() || selectedListing.pricePerHour}.00</h2>
                
                <div className="checkout-item-preview">
                  <img src={selectedListing.imageUrl} alt={selectedListing.title} />
                  <div>
                    <h4>{selectedListing.title}</h4>
                    <p>{selectedListing.location}</p>
                  </div>
                </div>

                <div className="checkout-summary-lines">
                  <div className="summary-line">
                    <span>Rate per hour</span>
                    <span>${selectedListing.pricePerHour}.00</span>
                  </div>
                  <div className="summary-line">
                    <span>Platform Service Fee</span>
                    <span>$10.00</span>
                  </div>
                  <div className="summary-line total-line">
                    <span>Total due</span>
                    <span>${calculateTotal() ? calculateTotal() + 10 : selectedListing.pricePerHour + 10}.00</span>
                  </div>
                </div>
              </div>

              <div className="checkout-right-pane">
                <form onSubmit={handleBooking} autoComplete="off" noValidate>
                  <h3>Booking Duration</h3>
                  <div className="duration-inputs">
                    <div className="stripe-input-group">
                      <label>Start Date & Time</label>
                      <input 
                        type="datetime-local" 
                        value={startTime} 
                        onChange={(e) => setStartTime(e.target.value)} 
                        onClick={(e) => e.target.showPicker && e.target.showPicker()}
                      />
                    </div>
                    <div className="stripe-input-group">
                      <label>End Date & Time</label>
                      <input 
                        type="datetime-local" 
                        value={endTime} 
                        onChange={(e) => setEndTime(e.target.value)} 
                        onClick={(e) => e.target.showPicker && e.target.showPicker()}
                      />
                    </div>
                  </div>

                  <h3>Contact Information</h3>
                  <div className="stripe-input-group">
                    <label>Email address</label>
                    <input 
                      type="email" 
                      name="spotshare_checkout_email"
                      id="spotshare_checkout_email"
                      autoComplete="new-password"
                      placeholder="you@example.com" 
                      value={checkoutForm.email} 
                      onChange={(e) => setCheckoutForm(prev => ({ ...prev, email: e.target.value }))} 
                    />
                  </div>

                  <h3>Payment Method</h3>
                  <div className="payment-method-tabs">
                    <div className={`payment-tab ${paymentMethod === 'stripe' ? 'active' : ''}`} onClick={() => setPaymentMethod('stripe')}>💳 Credit Card</div>
                  </div>

                  {paymentMethod === 'stripe' && (
                    <div className="stripe-card-container">
                      <div className="stripe-input-group">
                        <label>Card Information</label>
                        <div className="stripe-combined-input">
                          <input 
                            type="text" 
                            placeholder="4242 4242 4242 4242" 
                            value={checkoutForm.cardNumber}
                            onChange={handleCardNumberChange}
                            maxLength="19"
                          />
                          <div className="stripe-card-inline-group">
                            <input 
                              type="text" 
                              placeholder="MM/YY" 
                              value={checkoutForm.expiry}
                              onChange={handleExpiryChange}
                              maxLength="5"
                            />
                            <input 
                              type="password" 
                              placeholder="CVC" 
                              value={checkoutForm.cvc}
                              onChange={handleCvcChange}
                              maxLength="4"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="stripe-input-group">
                        <label>Cardholder Name</label>
                        <input 
                          type="text" 
                          placeholder="Full name on card" 
                          value={checkoutForm.cardholderName}
                          onChange={(e) => setCheckoutForm(prev => ({ ...prev, cardholderName: e.target.value }))}
                        />
                      </div>

                      <div className="stripe-input-group">
                        <label>Country or region</label>
                        <select 
                          value={checkoutForm.country}
                          onChange={(e) => setCheckoutForm(prev => ({ ...prev, country: e.target.value }))}
                        >
                          <option value="India">India</option>
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Canada">Canada</option>
                          <option value="Australia">Australia</option>
                          <option value="Germany">Germany</option>
                          <option value="France">France</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="btn-primary stripe-submit-btn">
                    Pay ${calculateTotal() ? calculateTotal() + 10 : selectedListing.pricePerHour + 10}.00 & Confirm Booking
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* SUCCESS VIEW */}
        {view === 'success' && latestBooking && (
          <div className="animated-page success-container">
            <div className="success-icon-circle">✓</div>
            <h2>Booking Confirmed!</h2>
            <p className="success-subtitle">Your reservation has been securely processed and confirmed.</p>
            
            <div className="booking-details-card">
              <p className="card-label">Booking Reference ID</p>
              <p className="card-value mono">{latestBooking._id}</p>
              
              <p className="card-label">Time Period</p>
              <p className="card-value">
                {new Date(latestBooking.startTime).toLocaleString()} → {new Date(latestBooking.endTime).toLocaleString()}
              </p>

              <p className="card-label">Total Paid</p>
              <p className="card-value highlight">${latestBooking.totalPrice}.00 ({latestBooking.paymentMethod.toUpperCase()})</p>
            </div>

            <div className="success-actions">
              <button onClick={() => { setView('home'); }} className="btn-primary">Browse More Spaces</button>
              <button onClick={fetchMyBookings} className="btn-secondary">View My Bookings</button>
            </div>
          </div>
        )}

        {/* LOGIN VIEW */}
        {view === 'login' && (
          <div className="animated-page auth-container">
            <h2>Welcome back</h2>
            <p className="auth-subtitle">Enter your credentials to access your account.</p>
            
            {authError && (
              <div style={{ marginBottom: '16px', padding: '12px', background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48', borderRadius: '8px', fontSize: '14px' }}>
                <span style={{ fontWeight: 'bold' }}>⚠️</span> {authError}
              </div>
            )}

            <form onSubmit={handleLogin} className="auth-form" noValidate>
              <div className="stripe-input-group">
                <label>Email address</label>
                <input 
                  type="email" 
                  placeholder="you@example.com" 
                  value={authForm.email}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="stripe-input-group">
                <label>Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={authForm.password}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
              <button type="submit" className="btn-primary">Log in</button>
            </form>
            
            <p className="auth-switch-text">
              Don't have an account? <span onClick={() => { setAuthError(''); setView('register'); }}>Sign up</span>
            </p>
          </div>
        )}

        {/* REGISTER VIEW */}
        {view === 'register' && (
          <div className="animated-page auth-container">
            <h2>Create an account</h2>
            <p className="auth-subtitle">Join SpotShare to start booking unique spaces.</p>
            
            {authError && (
              <div style={{ marginBottom: '16px', padding: '12px', background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48', borderRadius: '8px', fontSize: '14px' }}>
                <span style={{ fontWeight: 'bold' }}>⚠️</span> {authError}
              </div>
            )}

            <form onSubmit={handleRegister} className="auth-form" noValidate>
              <div className="stripe-input-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  value={authForm.name}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="stripe-input-group">
                <label>Email address</label>
                <input 
                  type="email" 
                  placeholder="you@example.com" 
                  value={authForm.email}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="stripe-input-group">
                <label>Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={authForm.password}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                />
              </div>
              <button type="submit" className="btn-primary">Create account</button>
            </form>
            
            <p className="auth-switch-text">
              Already have an account? <span onClick={() => { setAuthError(''); setView('login'); }}>Log in</span>
            </p>
          </div>
        )}

        {/* MY BOOKINGS DASHBOARD */}
        {view === 'dashboard' && (
          <div className="animated-page dashboard-view-container">
            <h2>My Bookings</h2>
            {myBookings.length === 0 ? (
              <div className="empty-bookings-card">
                <p>You haven't made any bookings yet.</p>
                <button onClick={() => setView('home')} className="btn-primary">Explore Spaces</button>
              </div>
            ) : (
              <div className="bookings-list">
                {myBookings.map(b => (
                  <div key={b._id} className="booking-card">
                    <div className="booking-info">
                      <h4>{b.listingId?.title || 'Space Rental'}</h4>
                      <p className="booking-location">{b.listingId?.location}</p>
                      <p className="booking-time">
                        <b>From:</b> {new Date(b.startTime).toLocaleString()}
                      </p>
                      <p className="booking-time">
                        <b>To:</b> {new Date(b.endTime).toLocaleString()}
                      </p>
                      <span className={`status-badge ${b.status?.toLowerCase() || 'confirmed'}`}>{b.status || 'Confirmed'}</span>
                    </div>
                    <div className="booking-action-pane">
                      <p className="booking-total">${b.totalPrice}.00</p>
                      {b.status !== 'Cancelled' && (
                        <button onClick={() => handleCancelBooking(b._id)} className="btn-secondary cancel-btn">
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ADMIN PANEL */}
        {view === 'admin' && user?.role === 'admin' && (
          <div className="animated-page admin-view-container">
            <h2>Admin Dashboard</h2>
            <div className="admin-stats-grid">
              <div className="stat-card">
                <p>Total Users</p>
                <h3>{adminData.totalUsers}</h3>
              </div>
              <div className="stat-card">
                <p>Total Listings</p>
                <h3>{adminData.totalListings}</h3>
              </div>
              <div className="stat-card">
                <p>Total Bookings</p>
                <h3>{adminData.totalBookings}</h3>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}