import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { addressAPI, orderAPI, paymentAPI } from '../utils/api';
import toast from 'react-hot-toast';
import './Checkout.css';

const Checkout = () => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    addressType: 'Home'
  });

  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await addressAPI.getAll();
      if (response.data.success) {
        setAddresses(response.data.addresses);
        const defaultAddr = response.data.addresses.find(a => a.isDefault);
        if (defaultAddr) setSelectedAddress(defaultAddr);
      }
    } catch (error) {
      console.error('Failed to fetch addresses', error);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const response = await addressAPI.create(newAddress);
      if (response.data.success) {
        toast.success('Address added successfully');
        setAddresses([...addresses, response.data.address]);
        setSelectedAddress(response.data.address);
        setShowAddressForm(false);
        setNewAddress({
          fullName: '',
          phone: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          pincode: '',
          landmark: '',
          addressType: 'Home'
        });
      }
    } catch (error) {
      toast.error('Failed to add address');
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    setLoading(true);

    try {
      // Create order
      const orderData = {
        items: cart.map(item => ({
          menuItem: item._id,
          quantity: item.quantity
        })),
        deliveryAddress: selectedAddress,
        paymentMethod: paymentMethod
      };

      const orderResponse = await orderAPI.create(orderData);

      if (!orderResponse.data.success) {
        throw new Error('Failed to create order');
      }

      const order = orderResponse.data.order;

      // Handle Cash on Delivery
      if (paymentMethod === 'cod') {
        clearCart();
        toast.success('Order placed successfully! Pay on delivery.');
        navigate('/orders');
        setLoading(false);
        return;
      }

      // Handle Razorpay payment
      // Load Razorpay
      const res = await loadRazorpay();

      if (!res) {
        toast.error('Failed to load payment gateway');
        setLoading(false);
        return;
      }

      // Create Razorpay order
      const paymentOrderResponse = await paymentAPI.createOrder({
        amount: order.totalAmount,
        orderId: order.orderId
      });

      const { orderId, amount, currency, key } = paymentOrderResponse.data;

      // Razorpay options
      const options = {
        key,
        amount,
        currency,
        name: 'FoodCart',
        description: `Order ${order.orderId}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            const verifyResponse = await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order.orderId
            });

            if (verifyResponse.data.success) {
              clearCart();
              toast.success('Order placed successfully!');
              navigate('/orders');
            }
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          email: user.email,
          contact: selectedAddress.phone
        },
        theme: {
          color: '#ff6b6b'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = getCartTotal() + 40;

  return (
    <div className="container checkout-page">
      <h1>Checkout</h1>

      <div className="checkout-layout">
        <div className="checkout-main">
          <div className="card">
            <h2>Delivery Address</h2>
            {addresses.map((addr) => (
              <div
                key={addr._id}
                className={`address-item ${selectedAddress?._id === addr._id ? 'selected' : ''}`}
                onClick={() => setSelectedAddress(addr)}
              >
                <input
                  type="radio"
                  checked={selectedAddress?._id === addr._id}
                  readOnly
                />
                <div>
                  <strong>{addr.fullName}</strong> - {addr.phone}
                  <p>{addr.addressLine1}, {addr.addressLine2}</p>
                  <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                </div>
              </div>
            ))}
            <button className="btn btn-outline" onClick={() => setShowAddressForm(!showAddressForm)}>
              + Add New Address
            </button>

            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="address-form">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newAddress.fullName}
                    onChange={(e) => setNewAddress({...newAddress, fullName: e.target.value})}
                    required
                  />
                </div>
                <div className="input-group">
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                    required
                  />
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Address Line 1"
                    value={newAddress.addressLine1}
                    onChange={(e) => setNewAddress({...newAddress, addressLine1: e.target.value})}
                    required
                  />
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Address Line 2 (Optional)"
                    value={newAddress.addressLine2}
                    onChange={(e) => setNewAddress({...newAddress, addressLine2: e.target.value})}
                  />
                </div>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">Save Address</button>
              </form>
            )}
          </div>

          <div className="card">
            <h2>Order Items</h2>
            {cart.map((item) => (
              <div key={item._id} className="order-item">
                <span>{item.name} x {item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="card">
            <h2>Payment Method</h2>
            <div className="payment-methods">
              <div
                className={`payment-option ${paymentMethod === 'razorpay' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('razorpay')}
              >
                <input
                  type="radio"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                />
                <div>
                  <strong>Online Payment (Razorpay)</strong>
                  <p>Pay securely using Credit/Debit Card, UPI, or Net Banking</p>
                </div>
              </div>
              <div
                className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('cod')}
              >
                <input
                  type="radio"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                />
                <div>
                  <strong>Cash on Delivery</strong>
                  <p>Pay with cash when your order arrives</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="checkout-sidebar">
          <div className="card">
            <h2>Payment Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{getCartTotal()}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Fee</span>
              <span>₹40</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{totalAmount}</span>
            </div>
            <button
              className="btn btn-primary btn-block"
              onClick={handlePlaceOrder}
              disabled={loading || !selectedAddress}
            >
              {loading ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order (COD)' : 'Pay with Razorpay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
