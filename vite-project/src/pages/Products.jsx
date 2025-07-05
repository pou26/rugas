import React, { useState } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  Plus, Search, Edit, Trash2,
  Package, Tag, DollarSign, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { productAPI } from '../services/api';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  // Fetch all products
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: productAPI.getAll,
  });

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: productAPI.create,
    onSuccess: () => {
      toast.success('Product created!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      resetForm();
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Create failed');
    }
  });

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => productAPI.update(id, data),
    onSuccess: () => {
      toast.success('Product updated!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      resetForm();
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Update failed');
    }
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: productAPI.delete,
    onSuccess: () => {
      toast.success('Product deleted!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  });

  const resetForm = () => {
    setShowModal(false);
    setEditingProduct(null);
    reset();
    setImagePreview('');
  };

  const onSubmit = (data) => {
    const payload = {
      name: data.name,
      category: data.category,
      description: data.description,
      price: parseFloat(data.price),
      imageUrl: data.imageUrl
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct._id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const filteredProducts = productsData?.data?.filter((product) => {
    const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      || product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = !categoryFilter || product.category === categoryFilter;
    return matchSearch && matchCategory;
  }) || [];

  const categories = [...new Set(productsData?.data?.map(p => p.category) || [])];

  const handleEdit = (product) => {
    setEditingProduct(product);
    setImagePreview(product.imageUrl);
    reset(product);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure?')) {
      deleteMutation.mutate(id);
    }
  };
  console.log('Products data:', filteredProducts);
  if (isLoading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-red-500 text-center p-8">Error loading products</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Add Product
        </button>
      </div>

      <div className="card p-4 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" />
          <input
            className="form-input pl-10 w-full"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="form-select min-w-[200px]"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center p-12">
            <Package size={48} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">No products found</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product._id} className="card">
              {/* <img
                src={product.imageUrl || '/api/placeholder/300/200'}
                onError={(e) => e.target.src = '/api/placeholder/300/200'}
                alt={product.name}
                className="w-full h-48 object-cover rounded-t"
              /> */}
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <div className="text-sm flex items-center gap-2 text-gray-500">
                  <Tag size={16} /> {product.category}
                </div>
                <p className="text-gray-600 text-sm">{product.description}</p>
                <div className="flex justify-between items-center">
                  <div className="text-green-600 font-bold flex items-center gap-1">
                    <DollarSign size={18} /> {product.price}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(product)}>
                      <Edit className="text-blue-600" />
                    </button>
                    <button onClick={() => handleDelete(product._id)}>
                      <Trash2 className="text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingProduct ? 'Edit' : 'Add'} Product</h2>
              <button onClick={resetForm}><X /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input {...register('name', { required: true })} placeholder="Product Name" className="form-input w-full" />
              <input {...register('category', { required: true })} placeholder="Category" className="form-input w-full" />
              <textarea {...register('description', { required: true })} placeholder="Description" className="form-textarea w-full" />
              <input {...register('price', { required: true })} type="number" placeholder="Price" className="form-input w-full" />
              <input
                {...register('imageUrl')}
                placeholder="Image URL"
                className="form-input w-full"
                onChange={(e) => setImagePreview(e.target.value)}
              />
              {imagePreview && <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover mt-2" />}
              <button type="submit" className="btn-primary w-full">
                {editingProduct ? 'Update' : 'Create'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
