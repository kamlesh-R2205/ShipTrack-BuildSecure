import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function CreateShipment({ onNavigate, onSelectShipment }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    senderDetails: {
      name: user?.name || '',
      phone: user?.phone || '',
      address: '',
      city: '',
      postalCode: '',
    },
    receiverDetails: {
      name: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
    },
    packageDetails: {
      weightKg: 1.0,
      description: '',
      isFragile: false,
      declaredValue: 1000,
      dimensions: { lengthCm: 20, widthCm: 15, heightCm: 10 },
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.createShipment(formData);
      onSelectShipment(res.shipment._id);
      onNavigate('shipment-details');
    } catch (err) {
      setError(err.message || 'Failed to dispatch shipment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-body" style={{ maxWidth: '900px' }}>
      <div className="flex-between mb-6">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Dispatch New Shipment</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Book a secure parcel delivery with end-to-end cryptographic tracking
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('customer-dashboard')}>
          Back to Dashboard
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', color: '#f87171', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Sender Details */}
        <div className="card mb-6">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📤</span> 1. Origin / Sender Information
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Sender Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.senderDetails.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    senderDetails: { ...formData.senderDetails, name: e.target.value },
                  })
                }
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Sender Phone</label>
              <input
                type="tel"
                className="form-input"
                value={formData.senderDetails.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    senderDetails: { ...formData.senderDetails, phone: e.target.value },
                  })
                }
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Pickup Street Address</label>
            <input
              type="text"
              className="form-input"
              value={formData.senderDetails.address}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  senderDetails: { ...formData.senderDetails, address: e.target.value },
                })
              }
              placeholder="e.g. Plot 42, Cyber Gateway, Hitec City"
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-input"
                value={formData.senderDetails.city}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    senderDetails: { ...formData.senderDetails, city: e.target.value },
                  })
                }
                placeholder="Hyderabad"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Postal / ZIP Code</label>
              <input
                type="text"
                className="form-input"
                value={formData.senderDetails.postalCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    senderDetails: { ...formData.senderDetails, postalCode: e.target.value },
                  })
                }
                placeholder="500081"
                required
              />
            </div>
          </div>
        </div>

        {/* Receiver Details */}
        <div className="card mb-6">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📥</span> 2. Destination / Recipient Information
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Recipient Full Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.receiverDetails.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    receiverDetails: { ...formData.receiverDetails, name: e.target.value },
                  })
                }
                placeholder="e.g. Vikram Sharma"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Recipient Phone</label>
              <input
                type="tel"
                className="form-input"
                value={formData.receiverDetails.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    receiverDetails: { ...formData.receiverDetails, phone: e.target.value },
                  })
                }
                placeholder="+91-9123456780"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Destination Delivery Address</label>
            <input
              type="text"
              className="form-input"
              value={formData.receiverDetails.address}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  receiverDetails: { ...formData.receiverDetails, address: e.target.value },
                })
              }
              placeholder="e.g. Tower 3, Bandra Kurla Complex"
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Destination City</label>
              <input
                type="text"
                className="form-input"
                value={formData.receiverDetails.city}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    receiverDetails: { ...formData.receiverDetails, city: e.target.value },
                  })
                }
                placeholder="Mumbai"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Postal / ZIP Code</label>
              <input
                type="text"
                className="form-input"
                value={formData.receiverDetails.postalCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    receiverDetails: { ...formData.receiverDetails, postalCode: e.target.value },
                  })
                }
                placeholder="400051"
                required
              />
            </div>
          </div>
        </div>

        {/* Package Specifications */}
        <div className="card mb-6">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>📦</span> 3. Parcel Specifications & Security
          </h2>
          <div className="form-group">
            <label className="form-label">Package Description</label>
            <textarea
              className="form-textarea"
              value={formData.packageDetails.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  packageDetails: { ...formData.packageDetails, description: e.target.value },
                })
              }
              placeholder="Detailed description of goods (e.g., Cryptographic Smart Cards & Readers)"
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Weight (Kilograms)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="500"
                className="form-input"
                value={formData.packageDetails.weightKg}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    packageDetails: { ...formData.packageDetails, weightKg: Number(e.target.value) },
                  })
                }
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Declared Value (₹ INR)</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={formData.packageDetails.declaredValue}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    packageDetails: { ...formData.packageDetails, declaredValue: Number(e.target.value) },
                  })
                }
              />
            </div>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <label className="form-label">Special Handling</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={formData.packageDetails.isFragile}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      packageDetails: { ...formData.packageDetails, isFragile: e.target.checked },
                    })
                  }
                />
                <span>Fragile / Sensitive Merchandise</span>
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
          disabled={loading}
        >
          {loading ? 'Creating & Generating Tracking...' : 'Confirm & Dispatch Shipment'}
        </button>
      </form>
    </div>
  );
}
