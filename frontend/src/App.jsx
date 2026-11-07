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
      showToast('Please fill out all required fields.', 'error');
      return;
    }
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
      showToast(err.response?.data?.message || 'Login failed', 'error');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!authForm.name || !authForm.email || !authForm.password) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }
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
      showToast(err.response?.data?.message || 'Registration failed', 'error');
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
    <div className="app-wrapper" style={{ width: '100vw', maxWidth: '100%', margin: 0, padding: 0, overflowX: 'hidden' }}>
      {toast.message && (
        <div className={`toast-notification ${toast.type}`}>
          <span style={{ fontSize: '1.2rem' }}>{toast.type === 'error' ? '⚠️' : '✅'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="navbar" style={{ width: '100%', maxWidth: '100%', padding: '1rem 3vw', boxSizing: 'border-box' }}>
        <div className="logo-container" onClick={() => { setView('home'); setStartTime(''); setEndTime(''); setSelectedCategory('All'); }}>
          <div className="logo-icon-wrapper">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21.7C17.3 17 20 13 20 9a8 8 0 1 0-16 0c0 4 2.7 8 8 12.7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
          </div>
          <h2 className="logo-text">Spot<span>Share</span></h2>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={() => { setView('home'); setStartTime(''); setEndTime(''); }} className={`btn-secondary ${view === 'home' ? 'active-tab' : ''}`}>
            Explore
          </button>
          {user ? (
            <>
              <button onClick={fetchMyBookings} className={`btn-secondary ${view === 'dashboard' ? 'active-tab' : ''}`}>
                My Bookings
              </button>
              {user.role === 'admin' && (
                <button onClick={fetchAdminStats} className={`btn-secondary ${view === 'admin' ? 'active-tab' : ''}`}>
                  Admin Panel
                </button>
              )}
              <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>Hi, {user.name}</span>
              <button onClick={handleLogout} className="btn-secondary">Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => { setAuthForm({ name: '', email: '', password: '', role: 'guest' }); setView('login'); }} className={`btn-secondary ${view === 'login' ? 'active-tab' : ''}`}>
                Login
              </button>
              <button onClick={() => { setAuthForm({ name: '', email: '', password: '', role: 'guest' }); setView('register'); }} className={`btn-primary ${view === 'register' ? 'active-tab' : ''}`} style={{ width: 'auto' }}>
                Sign up
              </button>
            </>
          )}
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="main-content" style={{ width: '100%', maxWidth: '100%', margin: 0, padding: '2rem 1.5vw', boxSizing: 'border-box' }}>
        {view === 'home' && (
          <div className="animated-page" style={{ width: '100%', maxWidth: '100%' }}>
            <div className="hero-text-container" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
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
            <div className="categories-bar" style={{ width: '100%', maxWidth: '100%' }}>
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

            <div className="listings-grid-wrapper" style={{ width: '100%', maxWidth: '100%', padding: '0 1vw', boxSizing: 'border-box' }}>
              <div className="listings-grid" style={{ width: '100%', maxWidth: '100%', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                {filteredListings.map(listing => (
                  <div key={listing._id} onClick={() => { setSelectedListing(listing); setStartTime(''); setEndTime(''); setView('details'); }} className="listing-card">
                    <img src={listing.imageUrl} alt={listing.title} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                    <div style={{ padding: '1.25rem' }}>
                      <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '1.1rem' }}>{listing.title}</h4>
                      <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem' }}>{listing.location}</p>
                      <p style={{ margin: 0, fontWeight: 700, color: '#0f172a', fontSize: '1.1rem' }}>
                        ${listing.pricePerHour} <span style={{ fontWeight: 400, fontSize: '0.85rem', color: '#64748b' }}>/ hour</span>
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
            <div style={{ width: '100%', margin: '2rem auto 0 auto', padding: '0 2%', boxSizing: 'border-box' }}>
               <button onClick={() => { setView('home'); setStartTime(''); setEndTime(''); }} className="btn-secondary">← Back to search</button>
            </div>

            <div className="checkout-split-container">
              <div className="checkout-left-pane">
                <p style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>SpotShare Secure Checkout</p>
                <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '2.2rem', color: '#0f172a' }}>${calculateTotal() || selectedListing.pricePerHour}.00</h2>
                
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', background: '#ffffff', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <img src={selectedListing.imageUrl} alt={selectedListing.title} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px' }} />
                  <div>
                    <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1rem', color: '#0f172a' }}>{selectedListing.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{selectedListing.location}</p>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155', fontSize: '0.95rem' }}>
                    <span>Rate per hour</span>
                    <span>${selectedListing.pricePerHour}.00</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155', fontSize: '0.95rem' }}>
                    <span>Platform Service Fee</span>
                    <span>$10.00</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0f172a', fontWeight: 700, fontSize: '1.1rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                    <span>Total due</span>
                    <span>${calculateTotal() ? calculateTotal() + 10 : selectedListing.pricePerHour + 10}.00</span>
                  </div>
                </div>
              </div>

              <div className="checkout-right-pane">
                <form onSubmit={handleBooking} autoComplete="off">
                  <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.1rem' }}>Booking Duration</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="stripe-input-group" style={{ margin: 0 }}>
                      <label>Start Date & Time</label>
                      <input 
                        type="datetime-local" 
                        value={startTime} 
                        onChange={(e) => setStartTime(e.target.value)} 
                        onClick={(e) => e.target.showPicker && e.target.showPicker()}
                        required 
                      />
                    </div>
                    <div className="stripe-input-group" style={{ margin: 0 }}>
                      <label>End Date & Time</label>
                      <input 
                        type="datetime-local" 
                        value={endTime} 
                        onChange={(e) => setEndTime(e.target.value)} 
                        onClick={(e) => e.target.showPicker && e.target.showPicker()}
                        required 
                      />
                    </div>
                  </div>

                  <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.1rem' }}>Contact Information</h3>
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
                      required 
                    />
                  </div>

                  <h3 style={{ margin: '1.5rem 0 1rem 0', color: '#0f172a', fontSize: '1.1rem' }}>Payment Method</h3>
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
                            required 
                          />
                          <div className="stripe-card-inline-group">
                            <input 
                              type="text" 
                              placeholder="MM/YY" 
                              value={checkoutForm.expiry}
                              onChange={handleExpiryChange}
                              maxLength="5"
                              required 
                            />
                            <input 
                              type="password" 
                              placeholder="CVC" 
                              value={checkoutForm.cvc}
                              onChange={handleCvcChange}
                              maxLength="4"
                              required 
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
                          required 
                        />
                      </div>

                      <div className="stripe-input-group" style={{ marginBottom: '1.5rem' }}>
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

                  <button type="submit" className="stripe-submit-btn">
                    Pay ${calculateTotal() ? calculateTotal() + 10 : selectedListing.pricePerHour + 10}.00 & Confirm Booking
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* SUCCESS VIEW */}
        {view === 'success' && latestBooking && (
          <div className="animated-page" style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center', background: '#fff', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <div style={{ width: '64px', height: '64px', background: '#dcfce7', color: '#15803d', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.5rem auto' }}>✓</div>
            <h2 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>Booking Confirmed!</h2>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>Your reservation has been securely processed and confirmed.</p>
            
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '10px', textAlign: 'left', marginBottom: '2rem', border: '1px solid var(--border)' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: '#0f172a' }}>Booking Reference ID</p>
              <p style={{ margin: '0 0 1rem 0', fontFamily: 'monospace', color: '#475569', fontSize: '0.9rem' }}>{latestBooking._id}</p>
              
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: '#0f172a' }}>Time Period</p>
              <p style={{ margin: '0 0 1rem 0', color: '#475569', fontSize: '0.9rem' }}>
                {new Date(latestBooking.startTime).toLocaleString()} → {new Date(latestBooking.endTime).toLocaleString()}
              </p>

              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: '#0f172a' }}>Total Paid</p>
              <p style={{ margin: 0, color: '#0f172a', fontWeight: 700, fontSize: '1.1rem' }}>${latestBooking.totalPrice}.00 ({latestBooking.paymentMethod.toUpperCase()})</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={() => { setView('home'); }} className="btn-primary" style={{ width: 'auto' }}>Browse More Spaces</button>
              <button onClick={fetchMyBookings} className="btn-secondary">View My Bookings</button>
            </div>
          </div>
        )}

        {/* LOGIN VIEW */}
        {view === 'login' && (
          <div className="animated-page" style={{ maxWidth: '420px', margin: '4rem auto', background: '#fff', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h2 style={{ marginBottom: '0.5rem', color: '#0f172a', fontSize: '1.8rem' }}>Welcome back</h2>
            <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Enter your credentials to access your account.</p>
            
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="stripe-input-group" style={{ margin: 0 }}>
                <label>Email address</label>
                <input 
                  type="email" 
                  placeholder="you@example.com" 
                  value={authForm.email}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                  required 
                />
              </div>
              <div className="stripe-input-group" style={{ margin: 0 }}>
                <label>Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={authForm.password}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                  required 
                />
              </div>
              <button type="submit" className="stripe-submit-btn" style={{ marginTop: '0.5rem' }}>Log in</button>
            </form>
            
            <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#64748b', fontSize: '0.9rem' }}>
              Don't have an account? <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setView('register')}>Sign up</span>
            </p>
          </div>
        )}

        {/* REGISTER VIEW */}
        {view === 'register' && (
          <div className="animated-page" style={{ maxWidth: '420px', margin: '4rem auto', background: '#fff', padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h2 style={{ marginBottom: '0.5rem', color: '#0f172a', fontSize: '1.8rem' }}>Create an account</h2>
            <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Join SpotShare to start booking unique spaces.</p>
            
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="stripe-input-group" style={{ margin: 0 }}>
                <label>Full Name</label>
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  value={authForm.name}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, name: e.target.value }))}
                  required 
                />
              </div>
              <div className="stripe-input-group" style={{ margin: 0 }}>
                <label>Email address</label>
                <input 
                  type="email" 
                  placeholder="you@example.com" 
                  value={authForm.email}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                  required 
                />
              </div>
              <div className="stripe-input-group" style={{ margin: 0 }}>
                <label>Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={authForm.password}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                  required 
                />
              </div>
              <button type="submit" className="stripe-submit-btn" style={{ marginTop: '0.5rem' }}>Create account</button>
            </form>
            
            <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#64748b', fontSize: '0.9rem' }}>
              Already have an account? <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setView('login')}>Log in</span>
            </p>
          </div>
        )}

        {/* MY BOOKINGS DASHBOARD */}
        {view === 'dashboard' && (
          <div className="animated-page" style={{ maxWidth: '900px', margin: '2rem auto' }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>My Bookings</h2>
            {myBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <p style={{ color: '#64748b', marginBottom: '1rem' }}>You haven't made any bookings yet.</p>
                <button onClick={() => setView('home')} className="btn-primary" style={{ width: 'auto' }}>Explore Spaces</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {myBookings.map(b => (
                  <div key={b._id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.3rem 0', color: '#0f172a', fontSize: '1.1rem' }}>{b.listingId?.title || 'Space Rental'}</h4>
                      <p style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.85rem' }}>{b.listingId?.location}</p>
                      <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', color: '#334155' }}>
                        <b>From:</b> {new Date(b.startTime).toLocaleString()}
                      </p>
                      <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#334155' }}>
                        <b>To:</b> {new Date(b.endTime).toLocaleString()}
                      </p>
                      <span className={`status-badge ${b.status?.toLowerCase() || 'confirmed'}`}>{b.status || 'Confirmed'}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 700, fontSize: '1.2rem', color: '#0f172a', marginBottom: '1rem' }}>${b.totalPrice}.00</p>
                      {b.status !== 'Cancelled' && (
                        <button onClick={() => handleCancelBooking(b._id)} className="btn-secondary" style={{ color: '#dc2626', borderColor: '#fca5a5' }}>
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
          <div className="animated-page" style={{ maxWidth: '1000px', margin: '2rem auto' }}>
            <h2 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>Admin Dashboard</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <p style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.9rem' }}>Total Users</p>
                <h3 style={{ margin: 0, fontSize: '2rem', color: '#0f172a' }}>{adminData.totalUsers}</h3>
              </div>
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <p style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.9rem' }}>Total Listings</p>
                <h3 style={{ margin: 0, fontSize: '2rem', color: '#0f172a' }}>{adminData.totalListings}</h3>
              </div>
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <p style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.9rem' }}>Total Bookings</p>
                <h3 style={{ margin: 0, fontSize: '2rem', color: '#0f172a' }}>{adminData.totalBookings}</h3>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}