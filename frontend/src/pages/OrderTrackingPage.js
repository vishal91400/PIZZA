import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTruck, FaPizzaSlice, FaClock, FaArrowLeft } from 'react-icons/fa';

import { trackOrder, selectCurrentOrder, selectOrderLoading, selectOrderError, clearCurrentOrder } from '../redux/slices/orderSlice';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const statusSteps = [
  { label: 'Preparing', icon: <FaPizzaSlice className="h-5 w-5" /> },
  { label: 'On The Way', icon: <FaTruck className="h-5 w-5" /> },
  { label: 'Delivered', icon: <FaCheckCircle className="h-5 w-5" /> },
];

const OrderTrackingPage = () => {
  const { orderNumber } = useParams();
  const dispatch = useDispatch();
  const order = useSelector(selectCurrentOrder);
  const loading = useSelector(selectOrderLoading);
  const error = useSelector(selectOrderError);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (orderNumber) {
      dispatch(trackOrder(orderNumber)).unwrap().catch(() => setNotFound(true));
    }
    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, orderNumber]);

  if (loading) {
    return <LoadingSpinner size="lg" className="mt-24" />;
  }

  if (notFound || error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <FaClock className="h-10 w-10 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
        <p className="text-gray-600 mb-6">We couldn't find an order with number <span className="font-mono">{orderNumber}</span>.</p>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  // Determine current step
  const currentStep = statusSteps.findIndex(step => step.label === order.status);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
          <FaArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Tracking</h1>
          <p className="text-gray-600 mb-6">
            Order Number: <span className="font-mono text-primary-600">{order.orderNumber}</span>
          </p>

          {/* Status Steps */}
          <div className="flex items-center justify-between mb-8">
            {statusSteps.map((step, idx) => (
              <div key={step.label} className="flex-1 flex flex-col items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full mb-2 ${idx <= currentStep ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                  {step.icon}
                </div>
                <span className={`text-xs font-medium ${idx <= currentStep ? 'text-primary-600' : 'text-gray-400'}`}>{step.label}</span>
                {idx < statusSteps.length - 1 && (
                  <div className={`h-1 w-16 mt-2 ${idx < currentStep ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>

          {/* Order Details */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Order Details</h2>
            <ul className="divide-y divide-gray-200">
              {order.items.map((item) => (
                <li key={item.pizza._id} className="py-2 flex justify-between items-center">
                  <span className="text-gray-800">{item.pizza.name} <span className="text-xs text-gray-500">x{item.quantity}</span></span>
                  <span className="text-gray-600">${item.totalPrice.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Delivery Info */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Delivery Info</h2>
            <p className="text-gray-700">
              <span className="font-medium">Name:</span> {order.customer.name}<br />
              <span className="font-medium">Phone:</span> {order.customer.phone}<br />
              <span className="font-medium">Address:</span> {order.customer.address.street}, {order.customer.address.city}, {order.customer.address.state} {order.customer.address.zipCode}
            </p>
            {order.customer.address.deliveryInstructions && (
              <p className="text-gray-500 mt-2">
                <span className="font-medium">Instructions:</span> {order.customer.address.deliveryInstructions}
              </p>
            )}
          </div>

          {/* Order Summary */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Order Summary</h2>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="font-medium">${order.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium">${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
              <span className="text-gray-900">Total</span>
              <span className="text-primary-600">${order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Status History */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Status History</h2>
            <ul className="divide-y divide-gray-200 text-sm">
              {order.statusHistory.map((status, idx) => (
                <li key={idx} className="py-1 flex justify-between items-center">
                  <span>{status.status}</span>
                  <span className="text-gray-500">{new Date(status.timestamp).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage; 