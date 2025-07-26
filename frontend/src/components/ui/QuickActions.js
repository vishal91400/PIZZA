import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaPizzaSlice, FaPhone, FaEnvelope, FaMapMarkerAlt,
  FaClock, FaStar, FaHeart, FaShare, FaPrint
} from 'react-icons/fa';

const QuickActions = ({ orderNumber, customerPhone, deliveryAddress }) => {
  const actions = [
    {
      icon: FaPizzaSlice,
      title: 'Reorder',
      description: 'Order the same items again',
      color: 'from-red-500 to-orange-500',
      link: '/menu',
      action: 'reorder'
    },
    {
      icon: FaPhone,
      title: 'Call Support',
      description: 'Get help with your order',
      color: 'from-green-500 to-emerald-500',
      action: 'call',
      phone: '+1-555-PIZZA'
    },
    {
      icon: FaEnvelope,
      title: 'Email Support',
      description: 'Send us a message',
      color: 'from-blue-500 to-cyan-500',
      action: 'email',
      email: 'support@pizzadelivery.com'
    },
    {
      icon: FaMapMarkerAlt,
      title: 'Delivery Address',
      description: 'View delivery location',
      color: 'from-purple-500 to-pink-500',
      action: 'address'
    },
    {
      icon: FaStar,
      title: 'Rate Order',
      description: 'Share your experience',
      color: 'from-yellow-500 to-orange-500',
      action: 'rate'
    },
    {
      icon: FaShare,
      title: 'Share Order',
      description: 'Share with friends',
      color: 'from-indigo-500 to-purple-500',
      action: 'share'
    }
  ];

  const handleAction = (action, data) => {
    switch (action) {
      case 'call':
        window.open(`tel:${data.phone}`, '_self');
        break;
      case 'email':
        window.open(`mailto:${data.email}?subject=Order Support - #${orderNumber}`, '_self');
        break;
      case 'address':
        // Open Google Maps with the delivery address
        const encodedAddress = encodeURIComponent(deliveryAddress);
        window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank');
        break;
      case 'rate':
        // Open rating modal or redirect to rating page
        alert('Rating feature coming soon!');
        break;
      case 'share':
        // Share order details
        if (navigator.share) {
          navigator.share({
            title: 'My Pizza Order',
            text: `Check out my pizza order #${orderNumber} from Pizza Delivery!`,
            url: window.location.href
          });
        } else {
          // Fallback for browsers that don't support Web Share API
          navigator.clipboard.writeText(`My pizza order #${orderNumber} from Pizza Delivery!`);
          alert('Order details copied to clipboard!');
        }
        break;
      case 'print':
        window.print();
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Quick Actions
        </h3>
        <p className="text-gray-600">
          Need help or want to do something else?
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAction(action.action, action)}
            className="group cursor-pointer"
          >
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg">
              <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${action.color} text-white rounded-xl mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <action.icon className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm mb-1">
                {action.title}
              </h4>
              <p className="text-xs text-gray-600">
                {action.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Order Details Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Order Number:</span>
            <span className="font-medium text-gray-900">#{orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phone:</span>
            <span className="font-medium text-gray-900">{customerPhone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className="font-medium text-green-600">Active</span>
          </div>
        </div>
      </div>

      {/* Additional Help */}
      <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200">
        <div className="flex items-center space-x-3">
          <div className="bg-red-500 p-2 rounded-full">
            <FaClock className="h-4 w-4 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">
              Need Immediate Help?
            </h4>
            <p className="text-xs text-gray-600">
              Our support team is available 24/7
            </p>
          </div>
        </div>
        <div className="mt-3 flex space-x-2">
          <button
            onClick={() => handleAction('call', { phone: '+1-555-PIZZA' })}
            className="flex-1 bg-red-500 text-white text-xs py-2 px-3 rounded-lg hover:bg-red-600 transition-colors"
          >
            Call Now
          </button>
          <button
            onClick={() => handleAction('email', { email: 'support@pizzadelivery.com' })}
            className="flex-1 bg-orange-500 text-white text-xs py-2 px-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Email
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions; 