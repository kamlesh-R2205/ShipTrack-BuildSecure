import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { CreateShipment } from './pages/CreateShipment';
import { MyShipments } from './pages/MyShipments';
import { ShipmentDetails } from './pages/ShipmentDetails';
import { DriverDashboard } from './pages/DriverDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Profile } from './pages/Profile';

export function App() {
  const { user, isAuthenticated, role, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('landing');
  const [selectedShipmentId, setSelectedShipmentId] = useState(null);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#090d16', color: '#94a3b8' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🛡️</div>
          <div>Initializing ShipTrack Secure Platform...</div>
        </div>
      </div>
    );
  }

  // Handle navigation requests
  const handleNavigate = (page) => {
    if (page === 'dashboard') {
      if (role === 'ADMIN') setCurrentPage('admin-dashboard');
      else if (role === 'DRIVER') setCurrentPage('driver-dashboard');
      else if (role === 'CUSTOMER') setCurrentPage('customer-dashboard');
      else setCurrentPage('landing');
      return;
    }
    setCurrentPage(page);
  };

  const handleSelectShipment = (id) => {
    setSelectedShipmentId(id);
  };

  // If not logged in and requesting protected page, show Landing or Login
  const isAuthPage = currentPage === 'login' || currentPage === 'register';
  const isPublicPage = currentPage === 'landing' || currentPage === 'public-track';

  if (!isAuthenticated && !isAuthPage && !isPublicPage) {
    return <Login onNavigate={handleNavigate} />;
  }

  if (currentPage === 'login') {
    return <Login onNavigate={handleNavigate} />;
  }

  if (currentPage === 'register') {
    return <Register onNavigate={handleNavigate} />;
  }

  return (
    <div className="app-container">
      {isAuthenticated && (
        <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
      )}

      <div className="main-content">
        <Navbar onNavigate={handleNavigate} currentPage={currentPage} />

        {/* Unauthenticated Landing / Public Track */}
        {(!isAuthenticated || currentPage === 'landing' || currentPage === 'public-track') && (
          <Landing onNavigate={handleNavigate} />
        )}

        {/* Customer Experience */}
        {isAuthenticated && currentPage === 'customer-dashboard' && (
          <CustomerDashboard
            onNavigate={handleNavigate}
            onSelectShipment={handleSelectShipment}
          />
        )}
        {isAuthenticated && currentPage === 'create-shipment' && (
          <CreateShipment
            onNavigate={handleNavigate}
            onSelectShipment={handleSelectShipment}
          />
        )}
        {isAuthenticated && currentPage === 'my-shipments' && (
          <MyShipments
            onNavigate={handleNavigate}
            onSelectShipment={handleSelectShipment}
          />
        )}

        {/* Driver Experience */}
        {isAuthenticated && currentPage === 'driver-dashboard' && (
          <DriverDashboard
            onNavigate={handleNavigate}
            onSelectShipment={handleSelectShipment}
          />
        )}

        {/* Admin Experience */}
        {isAuthenticated && currentPage === 'admin-dashboard' && (
          <AdminDashboard
            onNavigate={handleNavigate}
            onSelectShipment={handleSelectShipment}
            initialTab="overview"
          />
        )}
        {isAuthenticated && currentPage === 'admin-shipments' && (
          <AdminDashboard
            onNavigate={handleNavigate}
            onSelectShipment={handleSelectShipment}
            initialTab="overview"
          />
        )}
        {isAuthenticated && currentPage === 'admin-users' && (
          <AdminDashboard
            onNavigate={handleNavigate}
            onSelectShipment={handleSelectShipment}
            initialTab="users"
          />
        )}
        {isAuthenticated && currentPage === 'admin-security' && (
          <AdminDashboard
            onNavigate={handleNavigate}
            onSelectShipment={handleSelectShipment}
            initialTab="security"
          />
        )}

        {/* Shared Detail & Profile Experience */}
        {isAuthenticated && currentPage === 'shipment-details' && (
          <ShipmentDetails
            shipmentId={selectedShipmentId}
            onNavigate={handleNavigate}
          />
        )}
        {isAuthenticated && currentPage === 'profile' && (
          <Profile onNavigate={handleNavigate} />
        )}
      </div>
    </div>
  );
}
