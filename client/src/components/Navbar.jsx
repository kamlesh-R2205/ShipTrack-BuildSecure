import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export function Navbar({ onNavigate, currentPage }) {
  const { user, logout, role, quickLogin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length >= 2) {
      setIsSearching(true);
      try {
        const res = await api.globalSearch(val);
        setSearchResults(res.data || []);
        setShowResults(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleSelectResult = (item) => {
    setShowResults(false);
    setSearchQuery('');
    if (item.type === 'SHIPMENT') {
      onNavigate('shipment-dna', item.id);
    } else if (item.type === 'INCIDENT') {
      onNavigate('incidents');
    } else if (item.type === 'DRIVER' || item.type === 'USER') {
      onNavigate('drivers');
    } else if (item.type === 'EVENT') {
      onNavigate('flight-recorder');
    }
  };

  return (
    <header
      style={{
        height: '64px',
        padding: '0 2rem',
        background: '#0A1A30',
        borderBottom: '1px solid #17395C',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Left: Brand & Global Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flex: 1, maxWidth: '680px' }}>
        <div
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.65rem' }}
          onClick={() => onNavigate('overview')}
        >
          <span style={{ fontWeight: 800, letterSpacing: '0.04em', fontSize: '1.05rem', color: '#E6F1FF', whiteSpace: 'nowrap' }}>
            SHIPTRACK <span style={{ color: '#38BDF8' }}>GUARD</span>
          </span>
        </div>

        {/* Global Security Search Bar */}
        <div style={{ position: 'relative', width: '100%' }} ref={searchRef}>
          <input
            type="text"
            placeholder="Search shipment, vehicle, driver, incident or threat vector..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
            style={{
              width: '100%',
              padding: '0.55rem 0.95rem 0.55rem 2.4rem',
              background: '#071426',
              border: '1px solid #17395C',
              borderRadius: '8px',
              color: '#E6F1FF',
              fontSize: '0.82rem',
              outline: 'none',
            }}
          />
          <span
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#6F86A1',
              fontSize: '0.9rem',
              pointerEvents: 'none',
            }}
          >
            🔍
          </span>

          {/* Search Dropdown Results */}
          {showResults && searchResults.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '6px',
                background: '#0D2038',
                border: '1px solid #17395C',
                borderRadius: '8px',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.75)',
                zIndex: 1000,
                maxHeight: '320px',
                overflowY: 'auto',
              }}
            >
              <div style={{ padding: '0.5rem 0.85rem', fontSize: '0.7rem', color: '#6F86A1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Search Results ({searchResults.length})
              </div>
              {searchResults.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectResult(item)}
                  style={{
                    padding: '0.65rem 0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    borderTop: '1px solid #17395C',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#102943')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#E6F1FF' }}>{item.title}</div>
                    <div style={{ fontSize: '0.72rem', color: '#9FB4CC' }}>{item.subtitle}</div>
                  </div>
                  <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#38BDF8', background: '#0A1A30', padding: '0.15rem 0.45rem', borderRadius: '4px', border: '1px solid #17395C' }}>
                    {item.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: State, Posture, Role Switcher, Quick Actions, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* System State */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '6px', padding: '0.35rem 0.65rem' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981' }} />
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#10B981', letterSpacing: '0.04em' }}>
            SYSTEM SECURE
          </span>
        </div>

        {/* Security Posture */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#071426', border: '1px solid #17395C', borderRadius: '6px', padding: '0.35rem 0.65rem', fontSize: '0.74rem' }}>
          <span style={{ color: '#6F86A1' }}>POSTURE:</span>
          <span style={{ color: '#10B981', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>81 / 100</span>
        </div>

        {/* Demo Role Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', borderLeft: '1px solid #17395C', paddingLeft: '0.85rem' }}>
          <button
            onClick={() => quickLogin && quickLogin('admin@shiptrack.io', 'Admin@Secure2026!')}
            style={{
              padding: '0.3rem 0.55rem',
              fontSize: '0.74rem',
              borderRadius: '5px',
              border: role === 'ADMIN' ? '1px solid #38BDF8' : '1px solid #17395C',
              background: role === 'ADMIN' ? 'rgba(56, 189, 248, 0.15)' : '#071426',
              color: role === 'ADMIN' ? '#38BDF8' : '#9FB4CC',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Admin
          </button>
          <button
            onClick={() => quickLogin && quickLogin('driver1@shiptrack.io', 'Driver1@Secure2026!')}
            style={{
              padding: '0.3rem 0.55rem',
              fontSize: '0.74rem',
              borderRadius: '5px',
              border: role === 'DRIVER' ? '1px solid #10B981' : '1px solid #17395C',
              background: role === 'DRIVER' ? 'rgba(16, 185, 129, 0.15)' : '#071426',
              color: role === 'DRIVER' ? '#10B981' : '#9FB4CC',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Driver
          </button>
          <button
            onClick={() => quickLogin && quickLogin('customer1@shiptrack.io', 'Customer1@Secure2026!')}
            style={{
              padding: '0.3rem 0.55rem',
              fontSize: '0.74rem',
              borderRadius: '5px',
              border: role === 'CUSTOMER' ? '1px solid #60A5FA' : '1px solid #17395C',
              background: role === 'CUSTOMER' ? 'rgba(96, 165, 250, 0.15)' : '#071426',
              color: role === 'CUSTOMER' ? '#60A5FA' : '#9FB4CC',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Customer
          </button>
        </div>

        {/* Quick Action Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="btn btn-secondary"
            style={{
              fontSize: '0.78rem',
              padding: '0.38rem 0.85rem',
              borderRadius: '6px',
              fontWeight: 600,
              background: '#0D2038',
              border: '1px solid #17395C',
              color: '#E6F1FF',
            }}
          >
            ⚡ Quick Action
          </button>

          {showQuickActions && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: '8px',
                width: '220px',
                background: '#0D2038',
                border: '1px solid #17395C',
                borderRadius: '8px',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.75)',
                zIndex: 1000,
                overflow: 'hidden',
              }}
            >
              <div
                onClick={() => {
                  setShowQuickActions(false);
                  onNavigate('attack-simulator');
                }}
                style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#E6F1FF', cursor: 'pointer', borderBottom: '1px solid #17395C' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#102943')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                ⚡ Run Threat Simulation
              </div>
              <div
                onClick={() => {
                  setShowQuickActions(false);
                  onNavigate('reality-engine');
                }}
                style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#E6F1FF', cursor: 'pointer', borderBottom: '1px solid #17395C' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#102943')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                📍 Evaluate GPS Telemetry
              </div>
              <div
                onClick={() => {
                  setShowQuickActions(false);
                  onNavigate('flight-recorder');
                }}
                style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#E6F1FF', cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#102943')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                📼 Open Audit Black Box
              </div>
            </div>
          )}
        </div>

        {/* User Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', borderLeft: '1px solid #17395C', paddingLeft: '0.85rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#E6F1FF' }}>
              {user ? user.name : 'Security Administrator'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#6F86A1' }}>
              {role ? role : 'ADMIN'}
            </div>
          </div>
          {user && (
            <button
              onClick={logout}
              title="Sign Out"
              style={{
                background: '#071426',
                border: '1px solid #17395C',
                borderRadius: '6px',
                color: '#9FB4CC',
                cursor: 'pointer',
                padding: '0.35rem 0.55rem',
                fontSize: '0.8rem',
              }}
            >
              ⏻
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

