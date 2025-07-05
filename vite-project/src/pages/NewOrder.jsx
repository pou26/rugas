import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Minus, 
  ShoppingCart, 
  User, 
  Package, 
  DollarSign, 
  Check,
  X,
  Search,
  Users,
  Box
} from 'lucide-react';

// Import your real API - adjust path as needed
import { orderAPI, customerAPI, productAPI } from '../services/api';

const OrderCreationDemo = ({ onOrderCreated }) => {
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [orderCreated, setOrderCreated] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  const queryClient = useQueryClient();

  // Fetch customers
  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: customerAPI.getAll,
    select: (data) => data.data || []
  });

  const customers = customersData || [];

  // Fetch products
  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: productAPI.getAll,
    select: (data) => {
      if (Array.isArray(data.data)) {
        return data.data;
      } else if (data.data?.data) {
        return data.data.data;
      }
      return [];
    }
  });

  const products = productsData || [];

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: orderAPI.create,
    onSuccess: (response) => {
      // Invalidate and refetch orders
      queryClient.invalidateQueries(['orders']);
      
      // Show success message
      toast.success('Order created successfully!');
      
      // Set created order for display
      setCreatedOrder(response.data);
      setOrderCreated(true);
      
      // Call callback if provided
      if (onOrderCreated) {
        onOrderCreated(response.data);
      }
      
      // Reset form
      setSelectedCustomer('');
      setSelectedProducts([]);
      setNotes('');
      setSearchTerm('');
    },
    onError: (error) => {
      console.error('Create order error:', error);
      toast.error(error.response?.data?.error || 'Failed to create order');
    }
  });

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addProduct = (product) => {
    const existingProduct = selectedProducts.find(p => p.productId === product._id);
    if (existingProduct) {
      setSelectedProducts(selectedProducts.map(p =>
        p.productId === product._id 
          ? { ...p, quantity: p.quantity + 1 }
          : p
      ));
    } else {
      setSelectedProducts([...selectedProducts, {
        productId: product._id,
        product: product,
        quantity: 1
      }]);
    }
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity === 0) {
      setSelectedProducts(selectedProducts.filter(p => p.productId !== productId));
    } else {
      setSelectedProducts(selectedProducts.map(p =>
        p.productId === productId ? { ...p, quantity } : p
      ));
    }
  };

  const removeProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p.productId !== productId));
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const handleCreateOrder = async () => {
    if (!selectedCustomer || selectedProducts.length === 0) {
      toast.error('Please select a customer and at least one product');
      return;
    }

    // Prepare order data in the format expected by your API
    const orderData = {
      customer: selectedCustomer,
      products: selectedProducts.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      })),
      notes: notes || undefined
    };

    createOrderMutation.mutate(orderData);
  };

  const resetForm = () => {
    setOrderCreated(false);
    setCreatedOrder(null);
  };

  if (orderCreated && createdOrder) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <Check className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Order Created Successfully!</h2>
          <p className="text-green-600 mb-4">Order #{createdOrder._id?.slice(-8)} has been created</p>
          
          <div className="bg-white rounded-lg p-4 mb-4 text-left">
            <h3 className="font-semibold mb-2">Order Details:</h3>
            <p><strong>Customer:</strong> {createdOrder.customer?.name}</p>
            <p><strong>Email:</strong> {createdOrder.customer?.email}</p>
            <p><strong>Products:</strong></p>
            <ul className="ml-4 mt-2">
              {createdOrder.products?.map(item => (
                <li key={item.productId} className="flex justify-between">
                  <span>{item.product?.name} x{item.quantity}</span>
                  <span>${(item.product?.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t pt-2 mt-2">
              <p><strong>Total Amount: ${createdOrder.totalAmount?.toFixed(2)}</strong></p>
            </div>
            {createdOrder.notes && (
              <p className="mt-2"><strong>Notes:</strong> {createdOrder.notes}</p>
            )}
          </div>
          
          <button
            onClick={resetForm}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Another Order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-blue-600" />
            Create New Order
          </h1>
          <p className="text-gray-600 mt-2">Select a customer and products to create an order</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Customer Selection */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Select Customer
                </h2>
                <div className="space-y-3">
                  {customers.map(customer => (
                    <div
                      key={customer._id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedCustomer === customer._id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedCustomer(customer._id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {customer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium">{customer.name}</h3>
                          <p className="text-sm text-gray-600">{customer.email}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Notes */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Order Notes (Optional)</h2>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any special instructions or notes for this order..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                />
              </div>
            </div>

            {/* Product Selection */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Select Products
                </h2>
                
                {/* Search Products */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Product List */}
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredProducts.map(product => (
                    <div
                      key={product._id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-sm text-gray-600">{product.category}</p>
                          <p className="text-lg font-bold text-green-600">${product.price}</p>
                        </div>
                        <button
                          onClick={() => addProduct(product)}
                          className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Selected Products */}
          {selectedProducts.length > 0 && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Box className="w-5 h-5" />
                Selected Products
              </h2>
              <div className="space-y-3">
                {selectedProducts.map(item => (
                  <div key={item.productId} className="flex items-center justify-between bg-white p-4 rounded-lg">
                    <div>
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-sm text-gray-600">${item.product.price} each</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => removeProduct(item.productId)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Order Total */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center text-xl font-bold text-blue-800">
                  <span>Order Total:</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Create Order Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleCreateOrder}
              disabled={!selectedCustomer || selectedProducts.length === 0 || createOrderMutation.isPending}
              className={`px-8 py-3 rounded-lg font-medium transition-all ${
                selectedCustomer && selectedProducts.length > 0 && !createOrderMutation.isPending
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {createOrderMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Order...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Create Order
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCreationDemo;