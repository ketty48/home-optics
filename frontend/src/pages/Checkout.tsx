import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

// Matches the backend restriction
const EAST_AFRICAN_COUNTRIES = [
  'Rwanda',
  'Kenya',
  'Uganda',
  'Tanzania',
  'Burundi',
  'South Sudan',
  'Democratic Republic of the Congo',
  'Somalia'
];

const Checkout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { items, getTotalPrice } = useCartStore();
  const itemsPrice = getTotalPrice();
  
  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Rwanda');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CashOnDelivery');
  const [orderNotes, setOrderNotes] = useState('');
  
  // Derived State
  const isFreeShipping = country === 'Rwanda';

  // Guard: empty cart
  if (items.length === 0) {
    return (
      <div style={{ minHeight: '70vh', backgroundColor: '#f0f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito','Segoe UI',sans-serif" }}>
        <div style={{ textAlign: 'center', backgroundColor: 'white', borderRadius: 16, padding: '48px 40px', boxShadow: '0 2px 16px rgba(26,86,219,0.08)', border: '1px solid #e0e7ff', maxWidth: 360 }}>
          <div style={{ width: 72, height: 72, backgroundColor: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <ShoppingCart style={{ width: 34, height: 34, color: '#bfdbfe' }} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0a1628', marginBottom: 8 }}>Your cart is empty</h2>
          <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>Add some items before checking out.</p>
          <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, backgroundColor: '#1a56db', color: 'white', padding: '11px 28px', borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
            Go to Shop
          </Link>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (isAuthenticated && user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
    }
  }, [isAuthenticated, user]);

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save shipping address and payment method to local storage (or your state management store)
    const shippingAddress = { address, city, postalCode, country, phone };
    const guestDetails = { firstName, lastName, email };
    localStorage.setItem('shippingAddress', JSON.stringify(shippingAddress));
    localStorage.setItem('paymentMethod', JSON.stringify(paymentMethod));
    localStorage.setItem('orderNotes', JSON.stringify(orderNotes));
    localStorage.setItem('guestDetails', JSON.stringify(guestDetails));
    
    // Navigate to the next step (e.g., Place Order)
    navigate('/placeorder');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <form onSubmit={submitHandler} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6 lg:order-1">
            {/* Contact Info Section */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address Section */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Street address"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-2">Postal Code</label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Country</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {EAST_AFRICAN_COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <p className={`text-sm mt-1 ${isFreeShipping ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                    {isFreeShipping 
                      ? '✨ Free delivery available for Rwanda' 
                      : 'Standard shipping rates apply'}
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 order-first lg:order-2">
          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            {items.length === 0 ? (
              <p className="text-sm text-gray-500">Your cart is empty.</p>
            ) : (
              <>
                <div className="space-y-3 mb-4 max-h-56 overflow-y-auto pr-1">
                  {items.map(item => {
                    const img = item.images?.find((i: any) => i.isMain)?.url || item.images?.[0]?.url || '/placeholder.png';
                    return (
                      <div key={item._id} className="flex items-center gap-3">
                        <div className="w-12 h-12 flex-shrink-0 rounded border border-gray-200 overflow-hidden bg-gray-50">
                          <img src={img} alt={item.name} className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-800 flex-shrink-0">Fr {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-gray-100 pt-3 space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span>Fr {itemsPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className={isFreeShipping ? 'text-green-600 font-medium' : ''}>{isFreeShipping ? 'Free' : 'Fr 5,000'}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100 mt-2">
                    <span>Total</span>
                    <span className="text-blue-600">Fr {(itemsPrice + (isFreeShipping ? 0 : 5000)).toLocaleString()}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Payment Method Section */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            
            <div className="space-y-3">
              <div className={`flex items-center p-3 border rounded cursor-pointer transition-colors ${paymentMethod === 'CashOnDelivery' ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`} onClick={() => setPaymentMethod('CashOnDelivery')}>
                <input
                  type="radio"
                  id="cod"
                  name="paymentMethod"
                  value="CashOnDelivery"
                  checked={paymentMethod === 'CashOnDelivery'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 text-blue-600"
                />
                <label htmlFor="cod" className="ml-3 flex-1 cursor-pointer">
                  <span className="block font-medium">Cash on Delivery</span>
                  <span className="block text-sm text-gray-500">Pay when you receive your order</span>
                </label>
              </div>

              <div className={`flex items-center p-3 border rounded cursor-pointer transition-colors ${paymentMethod === 'Online' ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'}`} onClick={() => setPaymentMethod('Online')}>
                <input
                  type="radio"
                  id="online"
                  name="paymentMethod"
                  value="Online"
                  checked={paymentMethod === 'Online'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 text-blue-600"
                />
                <label htmlFor="online" className="ml-3 flex-1 cursor-pointer">
                  <span className="block font-medium">Online Payment</span>
                  <span className="block text-sm text-gray-500">Credit Card, Mobile Money</span>
                </label>
              </div>
            </div>
          </div>

          {/* Order Notes Section */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Order Notes (Optional)</h2>
            <p className="text-sm text-gray-500 mb-3">Add any special instructions for your delivery.</p>
            <textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              rows={4}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g., Please call upon arrival."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 shadow-lg"
          >
            Continue to Place Order
          </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;