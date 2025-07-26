import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  FaChartLine, FaChartBar, FaChartPie, FaDollarSign,
  FaShoppingCart, FaUsers, FaClock, FaTruck, FaCheckCircle,
  FaCalendarAlt, FaFilter
} from 'react-icons/fa';

import { fetchOrderStats } from '../../redux/slices/orderSlice';
import { selectOrderStats, selectOrderLoading } from '../../redux/slices/orderSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminAnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('orders');

  const dispatch = useDispatch();
  const stats = useSelector(selectOrderStats);
  const loading = useSelector(selectOrderLoading);

  useEffect(() => {
    dispatch(fetchOrderStats());
  }, [dispatch]);

  const analyticsCards = [
    {
      title: 'Total Revenue',
      value: `$${(stats?.totalRevenue || 0).toFixed(2)}`,
      icon: FaDollarSign,
      color: 'bg-green-500',
      change: '+12.5%',
      changeType: 'positive'
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: FaShoppingCart,
      color: 'bg-blue-500',
      change: '+8.2%',
      changeType: 'positive'
    },
    {
      title: 'Average Order Value',
      value: `$${stats?.totalOrders ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}`,
      icon: FaChartLine,
      color: 'bg-purple-500',
      change: '+5.1%',
      changeType: 'positive'
    },
    {
      title: 'Delivery Time',
      value: '32 min',
      icon: FaClock,
      color: 'bg-orange-500',
      change: '-2.3%',
      changeType: 'negative'
    }
  ];

  const statusDistribution = [
    { status: 'Delivered', count: stats?.deliveredOrders || 0, color: 'bg-green-500', percentage: 65 },
    { status: 'On The Way', count: stats?.onTheWayOrders || 0, color: 'bg-blue-500', percentage: 20 },
    { status: 'Preparing', count: stats?.preparingOrders || 0, color: 'bg-yellow-500', percentage: 10 },
    { status: 'Pending', count: stats?.pendingOrders || 0, color: 'bg-gray-500', percentage: 5 }
  ];

  const topPizzas = [
    { name: 'Margherita', orders: 45, revenue: 675 },
    { name: 'Pepperoni', orders: 38, revenue: 570 },
    { name: 'BBQ Chicken', orders: 32, revenue: 480 },
    { name: 'Veggie Supreme', orders: 28, revenue: 420 },
    { name: 'Hawaiian', orders: 25, revenue: 375 }
  ];

  const recentActivity = [
    { type: 'order', message: 'New order #1234 received', time: '2 min ago', icon: FaShoppingCart },
    { type: 'delivery', message: 'Order #1230 delivered', time: '15 min ago', icon: FaCheckCircle },
    { type: 'preparation', message: 'Order #1229 is being prepared', time: '25 min ago', icon: FaClock },
    { type: 'delivery', message: 'Order #1228 is on the way', time: '35 min ago', icon: FaTruck },
    { type: 'order', message: 'New order #1227 received', time: '1 hour ago', icon: FaShoppingCart }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your business performance and insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {analyticsCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                <card.icon className="text-white text-xl" />
              </div>
              <span className={`text-sm font-medium ${card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                {card.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{card.value}</h3>
            <p className="text-gray-600">{card.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Order Status Distribution</h2>
            <FaChartPie className="text-gray-400" />
          </div>

          <div className="space-y-4">
            {statusDistribution.map((item, index) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 ${item.color} rounded-full`}></div>
                  <span className="font-medium text-gray-900">{item.status}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 ${item.color.replace('bg-', 'bg-')} rounded-full`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Pizzas */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Top Performing Pizzas</h2>
            <FaChartBar className="text-gray-400" />
          </div>

          <div className="space-y-4">
            {topPizzas.map((pizza, index) => (
              <div key={pizza.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-red-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{pizza.name}</p>
                    <p className="text-sm text-gray-600">{pizza.orders} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${pizza.revenue}</p>
                  <p className="text-sm text-gray-600">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          <FaClock className="text-gray-400" />
        </div>

        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.type === 'order' ? 'bg-blue-100' :
                  activity.type === 'delivery' ? 'bg-green-100' :
                    activity.type === 'preparation' ? 'bg-yellow-100' :
                      'bg-gray-100'
                }`}>
                <activity.icon className={`text-lg ${activity.type === 'order' ? 'text-blue-600' :
                    activity.type === 'delivery' ? 'text-green-600' :
                      activity.type === 'preparation' ? 'text-yellow-600' :
                        'text-gray-600'
                  }`} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{activity.message}</p>
                <p className="text-sm text-gray-600">{activity.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Customer Satisfaction</h3>
            <FaChartLine className="text-gray-400" />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">4.8/5</div>
            <p className="text-gray-600">Average Rating</p>
            <div className="mt-4 flex justify-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`w-4 h-4 rounded-full ${i < 4 ? 'bg-yellow-400' : 'bg-gray-300'}`}></div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Peak Hours</h3>
            <FaClock className="text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">6:00 PM - 8:00 PM</span>
              <span className="font-medium">45 orders</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">12:00 PM - 2:00 PM</span>
              <span className="font-medium">32 orders</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">8:00 PM - 10:00 PM</span>
              <span className="font-medium">28 orders</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Delivery Performance</h3>
            <FaTruck className="text-gray-400" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">On Time</span>
              <span className="font-medium text-green-600">92%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Time</span>
              <span className="font-medium">32 min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Late Deliveries</span>
              <span className="font-medium text-red-600">8%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage; 