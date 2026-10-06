import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Security Intelligence Control Center Pages
import { Overview } from './pages/Overview';
import { ThreatMonitor } from './pages/ThreatMonitor';
import { SecuritySafetyCenter } from './pages/SecuritySafetyCenter';
import { FlightRecorder } from './pages/FlightRecorder';
import { RiskEngine } from './pages/RiskEngine';
import { AttackSimulator } from './pages/AttackSimulator';
import { RealityEngine } from './pages/RealityEngine';
import { SecurityGraph } from './pages/SecurityGraph';
import { Incidents } from './pages/Incidents';
import { Policies } from './pages/Policies';
import { ShipmentDNA } from './pages/ShipmentDNA';
import { Drivers } from './pages/Drivers';
import { SystemHealth } from './pages/SystemHealth';

// Core Logistics Operations Pages
import { CustomerDashboard } from './pages/CustomerDashboard';
import { CreateShipment } from './pages/CreateShipment';
import { MyShipments } from './pages/MyShipments';
import { DriverDashboard } from './pages/DriverDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ShipmentDetails } from './pages/ShipmentDetails';
import { Profile } from './pages/Profile';

export function App() {
  const { user, isAuthenticated, role, loading } = useAuth();
  // Default entrypoint is ALWAYS the ShipTrack Guard Overview (Section 23 & 33)
  const [currentPage, setCurrentPage] = useState('overview');
  const [selectedShipmentId, setSelectedShipmentId] = useState(null);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060913', color: '#94a3b8' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🛡️</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.04em' }}>SHIPTRACK GUARD</div>
          <div style={{ fontSize: '0.78rem', color: '#38bdf8', marginTop: '0.25rem' }}>Initializing Defensive Security Operations Center...</div>
        </div>
      </div>
    );
  }

  // Handle navigation requests
  const handleNavigate = (page, paramId = null) => {
    if (paramId) {
      setSelectedShipmentId(paramId);
    }

    if (page === 'dashboard') {
      if (role === 'ADMIN') setCurrentPage('overview');
      else if (role === 'DRIVER') setCurrentPage('driver-dashboard');
      else if (role === 'CUSTOMER') setCurrentPage('customer-dashboard');
      else setCurrentPage('overview');
      return;
    }

    if (page === 'shipments') {
      if (role === 'CUSTOMER') setCurrentPage('customer-dashboard');
      else if (role === 'DRIVER') setCurrentPage('driver-dashboard');
      else setCurrentPage('admin-dashboard');
      return;
    }

    // Direct link to shipment DNA inspection
    if (page.startsWith('/shipment/') && page.endsWith('/security')) {
      const idMatch = page.split('/')[2];
      if (idMatch) setSelectedShipmentId(idMatch);
      setCurrentPage('shipment-dna');
      return;
    }

    setCurrentPage(page);
  };

  const handleSelectShipment = (id) => {
    setSelectedShipmentId(id);
    setCurrentPage('shipment-details');
  };

  // Explicit Authentication Pages
  if (currentPage === 'login') {
    return <Login onNavigate={handleNavigate} />;
  }

  if (currentPage === 'register') {
    return <Register onNavigate={handleNavigate} />;
  }

  return (
    <div className="app-container" style={{ display: 'flex', minHeight: '100vh', background: '#050B16' }}>
      {/* Sidebar is permanently visible in SOC control center */}
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />

      <div className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto', background: '#071426' }}>
        <Navbar onNavigate={handleNavigate} currentPage={currentPage} />

        {/* ======================================================== */}
        {/* SHIPTRACK GUARD SECURITY INTELLIGENCE PAGES             */}
        {/* ======================================================== */}
        {currentPage === 'overview' && (
          <Overview onNavigate={handleNavigate} />
        )}

        {currentPage === 'threat-monitor' && (
          <ThreatMonitor onNavigate={handleNavigate} />
        )}

        {currentPage === 'security-safety-center' && (
          <SecuritySafetyCenter onNavigate={handleNavigate} />
        )}

        {currentPage === 'flight-recorder' && (
          <FlightRecorder onNavigate={handleNavigate} />
        )}

        {currentPage === 'risk-engine' && (
          <RiskEngine onNavigate={handleNavigate} />
        )}

        {currentPage === 'attack-simulator' && (
          <AttackSimulator onNavigate={handleNavigate} />
        )}

        {currentPage === 'reality-engine' && (
          <RealityEngine onNavigate={handleNavigate} />
        )}

        {currentPage === 'security-graph' && (
          <SecurityGraph onNavigate={handleNavigate} />
        )}

        {currentPage === 'incidents' && (
          <Incidents onNavigate={handleNavigate} />
        )}

        {currentPage === 'policies' && (
          <Policies onNavigate={handleNavigate} />
        )}

        {currentPage === 'shipment-dna' && (
          <ShipmentDNA initialId={selectedShipmentId || 'ST-2026-001'} onNavigate={handleNavigate} />
        )}

        {currentPage === 'drivers' && (
          <Drivers onNavigate={handleNavigate} />
        )}

        {currentPage === 'system-health' && (
          <SystemHealth onNavigate={handleNavigate} />
        )}

        {/* ======================================================== */}
        {/* ROLE-SPECIFIC OPERATIONAL DASHBOARDS                     */}
        {/* ======================================================== */}
        {currentPage === 'customer-dashboard' && (
          <CustomerDashboard
            onNavigate={handleNavigate}
            onSelectShipment={handleSelectShipment}
          />
        )}
        {currentPage === 'create-shipment' && (
          <CreateShipment
            onNavigate={handleNavigate}
            onSelectShipment={handleSelectShipment}
          />
        )}
        {currentPage === 'my-shipments' && (
          <MyShipments
            onNavigate={handleNavigate}
            onSelectShipment={handleSelectShipment}
          />
        )}

        {currentPage === 'driver-dashboard' && (
          <DriverDashboard
            onNavigate={handleNavigate}
            onSelectShipment={handleSelectShipment}
          />
        )}

        {(currentPage === 'admin-dashboard' || currentPage === 'admin-shipments') && (
          <AdminDashboard
            onNavigate={handleNavigate}
            onSelectShipment={handleSelectShipment}
            initialTab="overview"
          />
        )}
        {currentPage === 'admin-users' && (
          <AdminDashboard
            onNavigate={handleNavigate}
            onSelectShipment={handleSelectShipment}
            initialTab="users"
          />
        )}
        {currentPage === 'admin-security' && (
          <AdminDashboard
            onNavigate={handleNavigate}
            onSelectShipment={handleSelectShipment}
            initialTab="security"
          />
        )}

        {/* Shared Detail & Profile Experience */}
        {currentPage === 'shipment-details' && (
          <ShipmentDetails
            shipmentId={selectedShipmentId}
            onNavigate={handleNavigate}
          />
        )}
        {currentPage === 'profile' && (
          <Profile onNavigate={handleNavigate} />
        )}

        {/* Explicit Legacy Public Track / Landing (Only if specifically requested) */}
        {(currentPage === 'legacy-landing' || currentPage === 'public-track') && (
          <Landing onNavigate={handleNavigate} />
        )}
      </div>
    </div>
  );
}
