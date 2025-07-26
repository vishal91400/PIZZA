import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPizzaSlice, FaTruck, FaCheckCircle, FaClock, FaMapMarkerAlt } from 'react-icons/fa';

const LiveOrderTracker = ({ orderNumber, currentStatus = 'Preparing' }) => {
  const [estimatedTime, setEstimatedTime] = useState(25);
  const [currentStep, setCurrentStep] = useState(0);

  const orderSteps = [
    {
      status: 'Pending',
      title: 'Order Placed',
      description: 'Your order has been received',
      icon: FaPizzaSlice,
      color: 'bg-gray-400'
    },
    {
      status: 'Preparing',
      title: 'Preparing',
      description: 'Chef is making your pizza',
      icon: FaPizzaSlice,
      color: 'bg-blue-500'
    },
    {
      status: 'On The Way',
      title: 'On The Way',
      description: 'Your pizza is being delivered',
      icon: FaTruck,
      color: 'bg-orange-500'
    },
    {
      status: 'Delivered',
      title: 'Delivered',
      description: 'Enjoy your pizza!',
      icon: FaCheckCircle,
      color: 'bg-green-500'
    }
  ];

  useEffect(() => {
    const statusIndex = orderSteps.findIndex(step => step.status === currentStatus);
    setCurrentStep(statusIndex >= 0 ? statusIndex : 0);

    // Update estimated time based on status
    switch (currentStatus) {
      case 'Pending':
        setEstimatedTime(30);
        break;
      case 'Preparing':
        setEstimatedTime(20);
        break;
      case 'On The Way':
        setEstimatedTime(10);
        break;
      case 'Delivered':
        setEstimatedTime(0);
        break;
      default:
        setEstimatedTime(25);
    }
  }, [currentStatus]);

  const getStepColor = (index) => {
    if (index < currentStep) return 'bg-green-500';
    if (index === currentStep) return 'bg-blue-500';
    return 'bg-gray-300';
  };

  const getStepIconColor = (index) => {
    if (index < currentStep) return 'text-green-500';
    if (index === currentStep) return 'text-blue-500';
    return 'text-gray-400';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Order #{orderNumber}
        </h3>
        <p className="text-gray-600">
          Track your order in real-time
        </p>
      </div>

      {/* Progress Bar */}
      <div className="relative mb-8">
        <div className="flex items-center justify-between">
          {orderSteps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${getStepColor(index)}`}
              >
                <step.icon className="h-6 w-6 text-white" />
              </motion.div>
              <div className="text-center">
                <p className={`text-sm font-semibold ${getStepIconColor(index)}`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Progress Line */}
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-300 -z-10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / (orderSteps.length - 1)) * 100}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-blue-500 rounded-full"
          />
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-500 p-2 rounded-full">
            <FaClock className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">
              {orderSteps[currentStep]?.title}
            </h4>
            <p className="text-sm text-gray-600">
              {orderSteps[currentStep]?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Estimated Delivery */}
      {estimatedTime > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-500 p-2 rounded-full">
                <FaMapMarkerAlt className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  Estimated Delivery
                </h4>
                <p className="text-sm text-gray-600">
                  {estimatedTime} minutes remaining
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {Math.floor(estimatedTime / 60)}:{(estimatedTime % 60).toString().padStart(2, '0')}
              </div>
              <p className="text-xs text-gray-500">ETA</p>
            </div>
          </div>
        </div>
      )}

      {/* Live Updates */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Live Updates</h4>
        <div className="space-y-3">
          {orderSteps.slice(0, currentStep + 1).map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className="flex items-center space-x-3"
            >
              <div className={`w-2 h-2 rounded-full ${index === currentStep ? 'bg-blue-500' : 'bg-green-500'}`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {step.title}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
              {index === currentStep && (
                <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  Live
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveOrderTracker; 