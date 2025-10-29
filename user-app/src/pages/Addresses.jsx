import React, { useState, useEffect } from 'react';
import { addressAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { Trash2, Edit } from 'lucide-react';

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await addressAPI.getAll();
      if (response.data.success) {
        setAddresses(response.data.addresses);
      }
    } catch (error) {
      toast.error('Failed to fetch addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      await addressAPI.delete(id);
      toast.success('Address deleted successfully');
      setAddresses(addresses.filter(a => a._id !== id));
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await addressAPI.setDefault(id);
      toast.success('Default address updated');
      fetchAddresses();
    } catch (error) {
      toast.error('Failed to update default address');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <h1>My Addresses</h1>
      <div style={{ marginTop: '30px' }}>
        {addresses.length === 0 ? (
          <p>No addresses saved yet</p>
        ) : (
          addresses.map((addr) => (
            <div key={addr._id} className="card" style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>{addr.fullName}</strong> - {addr.phone}
                  {addr.isDefault && <span className="badge badge-primary" style={{ marginLeft: '10px' }}>Default</span>}
                  <p>{addr.addressLine1}, {addr.addressLine2}</p>
                  <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {!addr.isDefault && (
                    <button className="btn btn-outline" onClick={() => handleSetDefault(addr._id)}>
                      Set Default
                    </button>
                  )}
                  <button className="btn btn-outline" onClick={() => handleDelete(addr._id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Addresses;
