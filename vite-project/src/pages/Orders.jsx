import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  PlusIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// Mock API functions - replace with your actual API calls
const api = {
  getOrders: async () => {
    // Replace with your actual API endpoint
    const response = await fetch('/api/orders');
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  },
  
  getCustomers: async () => {
    const response = await fetch('/api/customers');
    if (!response.ok) throw new Error('Failed to fetch customers');
    return response.json();
  },
  
  getProducts: async () => {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },
  
  createOrder: async (orderData) => {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!response.ok) throw new Error('Failed to create order');
    return response.json();
  },
  
  updateOrderStatus: async ({ orderId, status }) => {
    const response = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update order status');
    return response.json();
  },
  
  deleteOrder: async (orderId) => {
    const response = await fetch(`/api/orders/${orderId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete order');
    return response.json();
  }
};

const OrderStatusBadge = ({ status }) => {
  const statusConfig = {
    placed: { color: 'bg-blue-100 text-blue-800', icon: ClockIcon },
    shipped: { color: 'bg-yellow-100 text-yellow-800', icon: TruckIcon },
    delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
    cancelled: { color: 'bg-red-100 text-red-800', icon: XCircleIcon }
  };
  
  const config = statusConfig[status] || statusConfig.placed;
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const CreateOrderModal = ({ isOpen, onClose, customers, products }) => {
  const [formData, setFormData] = useState({
    customerId: '',
    productId: '',
    quantity: 1,
    notes: ''
  });
  
  const queryClient = useQueryClient();
  
  const createOrderMutation = useMutation(api.createOrder, {
    onSuccess: () => {
      queryClient.invalidateQueries('orders');
      toast.success('Order created successfully!');
      onClose();
      setFormData({ customerId: '', productId: '', quantity: 1, notes: '' });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create order');
    }
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customerId || !formData.productId) {
      toast.error('Please select both customer and product');
      return;
    }
    
    const selectedProduct = products.find(p => p.id === formData.productId);
    const selectedCustomer = customers.find(c => c.id === formData.customerId);
    
    const orderData = {
      ...formData,
      totalAmount: selectedProduct.price * formData.quantity,
      status: 'placed',
      orderDate: new Date().toISOString(),
      customer: selectedCustomer,
      product: selectedProduct
    };
    
    createOrderMutation.mutate(orderData);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Create New Order</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer
            </label>
            <select
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select Customer</option>
              {customers?.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.email}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product
            </label>
            <select
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select Product</option>
              {products?.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - ${product.price}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createOrderMutation.isLoading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {createOrderMutation.isLoading ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const OrderRow = ({ order, onStatusUpdate, onDelete }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(order.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        #{order.id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {order.customer?.name || 'Unknown Customer'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {order.product?.name || 'Unknown Product'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {order.product?.category || 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {order.quantity}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        ${order.totalAmount?.toFixed(2) || '0.00'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <OrderStatusBadge status={order.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(order.orderDate).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex items-center space-x-2">
          {order.status === 'placed' && (
            <button
              onClick={() => handleStatusChange('shipped')}
              disabled={isUpdating}
              className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
              title="Mark as Shipped"
            >
              <TruckIcon className="w-4 h-4" />
            </button>
          )}
          {order.status === 'shipped' && (
            <button
              onClick={() => handleStatusChange('delivered')}
              disabled={isUpdating}
              className="text-green-600 hover:text-green-900 disabled:opacity-50"
              title="Mark as Delivered"
            >
              <CheckCircleIcon className="w-4 h-4" />
            </button>
          )}
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <button
              onClick={() => handleStatusChange('cancelled')}
              disabled={isUpdating}
              className="text-red-600 hover:text-red-900 disabled:opacity-50"
              title="Cancel Order"
            >
              <XCircleIcon className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(order.id)}
            className="text-red-600 hover:text-red-900"
            title="Delete Order"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

const Orders = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    customer: '',
    category: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  
  const queryClient = useQueryClient();
  
  // Fetch orders
  const { data: orders = [], isLoading: ordersLoading, error: ordersError } = useQuery(
    'orders',
    api.getOrders,
    { staleTime: 5 * 60 * 1000 }
  );
  
  // Fetch customers for dropdown
  const { data: customers = [] } = useQuery('customers', api.getCustomers);
  
  // Fetch products for dropdown
  const { data: products = [] } = useQuery('products', api.getProducts);
  
  // Update order status mutation
  const updateStatusMutation = useMutation(api.updateOrderStatus, {
    onSuccess: () => {
      queryClient.invalidateQueries('orders');
      toast.success('Order status updated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update order status');
    }
  });
  
  // Delete order mutation
  const deleteOrderMutation = useMutation(api.deleteOrder, {
    onSuccess: () => {
      queryClient.invalidateQueries('orders');
      toast.success('Order deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete order');
    }
  });
  
  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = !filters.search || 
        order.customer?.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        order.product?.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        order.id.toString().includes(filters.search);
      
      const matchesStatus = !filters.status || order.status === filters.status;
      const matchesCustomer = !filters.customer || order.customer?.id === filters.customer;
      const matchesCategory = !filters.category || order.product?.category === filters.category;
      
      return matchesSearch && matchesStatus && matchesCustomer && matchesCategory;
    });
  }, [orders, filters]);
  
  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = orders.map(order => order.product?.category).filter(Boolean);
    return [...new Set(cats)];
  }, [orders]);
  
  const handleStatusUpdate = async (orderId, status) => {
    updateStatusMutation.mutate({ orderId, status });
  };
  
  const handleDelete = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      deleteOrderMutation.mutate(orderId);
    }
  };
  
  const clearFilters = () => {
    setFilters({ search: '', status: '', customer: '', category: '' });
  };
  
  if (ordersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (ordersError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Error loading orders: {ordersError.message}</div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage all customer orders and track their status
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Order
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="mt-6 bg-white shadow rounded-lg">
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <FunnelIcon className="w-4 h-4 mr-2" />
                Filters
              </button>
            </div>
            <div className="text-sm text-gray-500">
              {filteredOrders.length} of {orders.length} orders
            </div>
          </div>
          
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Status</option>
                <option value="placed">Placed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <select
                value={filters.customer}
                onChange={(e) => setFilters({ ...filters, customer: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Customers</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
              
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
        
        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    onStatusUpdate={handleStatusUpdate}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Create Order Modal */}
      <CreateOrderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        customers={customers}
        products={products}
      />
    </div>
  );
};

export default Orders;