import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import { 
  ShoppingCart, 
  Users, 
  Package, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ArrowRight,
  Calendar,
  DollarSign
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
const { data: stats, isLoading, error } = useQuery({
  queryKey: ['dashboard-stats'],
  queryFn: dashboardAPI.getStats,
});

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card">
              <div className="card-body">
                <div className="h-12 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-lg">Error loading dashboard data</div>
        <p className="text-gray-600 mt-2">Please try refreshing the page</p>
      </div>
    );
  }

  const { 
    totalOrders, 
    totalCustomers, 
    totalProducts, 
    ordersByStatus, 
    recentOrders, 
    monthlyRevenue 
  } = stats?.data || {};

  // Status colors and icons
  const getStatusColor = (status) => {
    switch (status) {
      case 'placed': return 'text-blue-600 bg-blue-100';
      case 'shipped': return 'text-orange-600 bg-orange-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'placed': return <Clock className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Chart data
  const revenueData = monthlyRevenue?.map(item => ({
    month: `${item._id.month}/${item._id.year}`,
    revenue: item.revenue,
    orders: item.orders
  })) || [];

  const pieData = ordersByStatus?.map(item => ({
    name: item._id,
    value: item.count,
    color: item._id === 'placed' ? '#3b82f6' : 
           item._id === 'shipped' ? '#f59e0b' : 
           item._id === 'delivered' ? '#10b981' : '#ef4444'
  })) || [];

  const statCards = [
    {
      title: 'Total Orders',
      value: totalOrders || 0,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      link: '/orders'
    },
    {
      title: 'Total Customers',
      value: totalCustomers || 0,
      icon: Users,
      color: 'bg-green-500',
      link: '/customers'
    },
    {
      title: 'Total Products',
      value: totalProducts || 0,
      icon: Package,
      color: 'bg-purple-500',
      link: '/products'
    },
    {
      title: 'Monthly Revenue',
      value: `$${revenueData[revenueData.length - 1]?.revenue?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'bg-orange-500',
      link: '/orders'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to your order management dashboard</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              to={stat.link}
              className="card hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <div className="card-body p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Revenue</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders by Status */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Orders by Status</h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          <Link 
            to="/orders" 
            className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            View all <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="bg-gray-50">
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders?.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="font-medium text-gray-900">{order.orderNumber}</td>
                    <td>
                      <div>
                        <div className="font-medium text-gray-900">{order.customer?.name}</div>
                        <div className="text-sm text-gray-500">{order.customer?.email}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </span>
                    </td>
                    <td className="font-medium">${order.totalAmount?.toFixed(2)}</td>
                    <td className="text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;