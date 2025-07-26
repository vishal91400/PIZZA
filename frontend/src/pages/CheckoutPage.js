import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaCreditCard, FaMoneyBillWave, FaWallet } from 'react-icons/fa';

import {
  selectCartItems,
  selectCartTotal,
  selectCartIsEmpty,
  selectDeliveryFee,
  selectTax,
  selectGrandTotal,
  clearCart
} from '../redux/slices/cartSlice';
import { createOrder } from '../redux/slices/orderSlice';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const cartIsEmpty = useSelector(selectCartIsEmpty);
  const deliveryFee = useSelector(selectDeliveryFee);
  const tax = useSelector(selectTax);
  const grandTotal = useSelector(selectGrandTotal);
  const orderLoading = useSelector(state => state.order.loading);

  const [formData, setFormData] = useState({
    customer: {
      name: '',
      phone: '',
      email: ''
    },
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      deliveryInstructions: ''
    },
    paymentMethod: 'Cash on Delivery',
    specialInstructions: ''
  });

  const [errors, setErrors] = useState({});

  // Redirect if cart is empty
  if (cartIsEmpty) {
    navigate('/menu');
    return null;
  }

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));

    // Clear error when user starts typing
    if (errors[section]?.[field]) {
      setErrors(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: ''
        }
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate customer info
    if (!formData.customer.name.trim()) {
      newErrors.customer = { ...newErrors.customer, name: 'Name is required' };
    }
    if (!formData.customer.phone.trim()) {
      newErrors.customer = { ...newErrors.customer, phone: 'Phone is required' };
    }
    if (formData.customer.email && !/\S+@\S+\.\S+/.test(formData.customer.email)) {
      newErrors.customer = { ...newErrors.customer, email: 'Invalid email format' };
    }

    // Validate address
    if (!formData.address.street.trim()) {
      newErrors.address = { ...newErrors.address, street: 'Street address is required' };
    }
    if (!formData.address.city.trim()) {
      newErrors.address = { ...newErrors.address, city: 'City is required' };
    }
    if (!formData.address.state.trim()) {
      newErrors.address = { ...newErrors.address, state: 'State is required' };
    }
    if (!formData.address.zipCode.trim()) {
      newErrors.address = { ...newErrors.address, zipCode: 'ZIP code is required' };
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    const orderData = {
      customer: formData.customer,
      items: cartItems.map(item => ({
        pizza: item.pizza._id,
        quantity: item.quantity
      })),
      paymentMethod: formData.paymentMethod,
      specialInstructions: formData.specialInstructions
    };

    try {
      const result = await dispatch(createOrder(orderData)).unwrap();
      dispatch(clearCart());
      toast.success('Order placed successfully!');
      navigate(`/track/${result.data.orderNumber}`);
    } catch (error) {
      toast.error(error || 'Failed to place order');
    }
  };

  const paymentMethods = [
    { value: 'Cash on Delivery', label: 'Cash on Delivery', icon: <FaMoneyBillWave /> },
    { value: 'Credit Card', label: 'Credit Card', icon: <FaCreditCard /> },
    { value: 'Debit Card', label: 'Debit Card', icon: <FaCreditCard /> },
    { value: 'Digital Wallet', label: 'Digital Wallet', icon: <FaWallet /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <FaArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">
            Complete your order details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Customer Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.customer.name}
                    onChange={(e) => handleInputChange('customer', 'name', e.target.value)}
                    className={`input ${errors.customer?.name ? 'border-red-500' : ''}`}
                    placeholder="Enter your full name"
                  />
                  {errors.customer?.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.customer.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.customer.phone}
                    onChange={(e) => handleInputChange('customer', 'phone', e.target.value)}
                    className={`input ${errors.customer?.phone ? 'border-red-500' : ''}`}
                    placeholder="Enter your phone number"
                  />
                  {errors.customer?.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.customer.phone}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.customer.email}
                    onChange={(e) => handleInputChange('customer', 'email', e.target.value)}
                    className={`input ${errors.customer?.email ? 'border-red-500' : ''}`}
                    placeholder="Enter your email address"
                  />
                  {errors.customer?.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.customer.email}</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Delivery Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Delivery Address
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => handleInputChange('address', 'street', e.target.value)}
                    className={`input ${errors.address?.street ? 'border-red-500' : ''}`}
                    placeholder="Enter your street address"
                  />
                  {errors.address?.street && (
                    <p className="text-red-500 text-sm mt-1">{errors.address.street}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => handleInputChange('address', 'city', e.target.value)}
                      className={`input ${errors.address?.city ? 'border-red-500' : ''}`}
                      placeholder="City"
                    />
                    {errors.address?.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.address.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) => handleInputChange('address', 'state', e.target.value)}
                      className={`input ${errors.address?.state ? 'border-red-500' : ''}`}
                      placeholder="State"
                    />
                    {errors.address?.state && (
                      <p className="text-red-500 text-sm mt-1">{errors.address.state}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      value={formData.address.zipCode}
                      onChange={(e) => handleInputChange('address', 'zipCode', e.target.value)}
                      className={`input ${errors.address?.zipCode ? 'border-red-500' : ''}`}
                      placeholder="ZIP Code"
                    />
                    {errors.address?.zipCode && (
                      <p className="text-red-500 text-sm mt-1">{errors.address.zipCode}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Instructions (Optional)
                  </label>
                  <textarea
                    value={formData.address.deliveryInstructions}
                    onChange={(e) => handleInputChange('address', 'deliveryInstructions', e.target.value)}
                    className="textarea"
                    placeholder="Any special delivery instructions..."
                    rows="3"
                  />
                </div>
              </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Payment Method
              </h2>

              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label key={method.value} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={formData.paymentMethod === method.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <div className="flex items-center space-x-2">
                      <span className="text-primary-600">{method.icon}</span>
                      <span className="text-gray-700">{method.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </motion.div>

            {/* Special Instructions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Special Instructions (Optional)
              </h2>

              <textarea
                value={formData.specialInstructions}
                onChange={(e) => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                className="textarea"
                placeholder="Any special instructions for your order..."
                rows="4"
              />
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Order Summary
              </h2>

              {/* Order Items */}
              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div key={item.pizza._id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item.pizza.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${cartTotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>

                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-semibold text-primary-600">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={orderLoading}
                className="w-full mt-6 btn btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {orderLoading ? 'Placing Order...' : 'Place Order'}
              </button>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage; 