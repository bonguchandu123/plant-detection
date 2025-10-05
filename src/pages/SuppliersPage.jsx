import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Package, Star, Filter, Plus, Edit, Trash2, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:8000';

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const {getToken} = useAuth()

  // Fetch suppliers on mount
  useEffect(() => {
    fetchSuppliers();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/suppliers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter suppliers
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.products_available.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLocation = !selectedLocation || supplier.location.includes(selectedLocation);
    const matchesProduct = !selectedProduct || supplier.products_available.includes(selectedProduct);
    
    return matchesSearch && matchesLocation && matchesProduct;
  });

  // Get unique locations and products for filters
  const locations = [...new Set(suppliers.map(s => s.location))];
  const allProducts = [...new Set(suppliers.flatMap(s => s.products_available))];

  const handleContactClick = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmailClick = (email) => {
    window.location.href = `mailto:${email}`;
  };

  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setShowAddModal(true);
  };

  const handleDeleteSupplier = async (supplierId) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/suppliers/${supplierId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchSuppliers();
        alert('Supplier deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
      alert('Failed to delete supplier');
    }
  };

  const handleSeedSuppliers = async () => {
    if (!window.confirm('This will add sample supplier data to your database. Continue?')) return;

    setLoading(true);
    try {
      const token =  getToken();
      const response = await fetch(`${API_BASE_URL}/api/admin/seed-suppliers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchSuppliers();
        alert('Sample suppliers added successfully!');
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to seed suppliers');
      }
    } catch (error) {
      console.error('Error seeding suppliers:', error);
      alert('Failed to seed suppliers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Organic Suppliers Directory</h1>
            <p className="text-gray-600 mt-1">Find trusted organic product suppliers in your region</p>
          </div>
          
          {currentUser?.role === 'specialist' && (
            <div className="flex gap-3">
              <button
                onClick={handleSeedSuppliers}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Package size={20} />
                Seed Data
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <Plus size={20} />
                Add Supplier
              </button>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search suppliers or products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Location Filter */}
            <div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                >
                  <option value="">All Locations</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product Filter */}
            <div>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                >
                  <option value="">All Products</option>
                  {allProducts.map(prod => (
                    <option key={prod} value={prod}>{prod}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || selectedLocation || selectedProduct) && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchTerm && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Search: {searchTerm}
                  <button onClick={() => setSearchTerm('')} className="ml-2">×</button>
                </span>
              )}
              {selectedLocation && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {selectedLocation}
                  <button onClick={() => setSelectedLocation('')} className="ml-2">×</button>
                </span>
              )}
              {selectedProduct && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {selectedProduct}
                  <button onClick={() => setSelectedProduct('')} className="ml-2">×</button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          Showing {filteredSuppliers.length} of {suppliers.length} suppliers
        </div>

        {/* Suppliers Grid */}
        {filteredSuppliers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No suppliers found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.map((supplier) => (
              <SupplierCard
                key={supplier.id}
                supplier={supplier}
                onContactClick={handleContactClick}
                onEmailClick={handleEmailClick}
                onEdit={handleEditSupplier}
                onDelete={handleDeleteSupplier}
                currentUser={currentUser}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Supplier Modal */}
      {showAddModal && (
        <AddSupplierModal
          supplier={editingSupplier}
          onClose={() => {
            setShowAddModal(false);
            setEditingSupplier(null);
          }}
          onSuccess={() => {
            setShowAddModal(false);
            setEditingSupplier(null);
            fetchSuppliers();
          }}
        />
      )}
    </div>
  );
};

const AddSupplierModal = ({ supplier, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    location: supplier?.location || '',
    phone: supplier?.contact_info?.phone || '',
    email: supplier?.contact_info?.email || '',
    address: supplier?.contact_info?.address || '',
    website: supplier?.contact_info?.website || '',
    products_available: supplier?.products_available || [],
    crop_association: supplier?.crop_association || []
  });
  const [productInput, setProductInput] = useState('');
  const [cropInput, setCropInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (formData.products_available.length === 0) {
      newErrors.products = 'At least one product is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddProduct = () => {
    if (productInput.trim() && !formData.products_available.includes(productInput.trim())) {
      setFormData({
        ...formData,
        products_available: [...formData.products_available, productInput.trim()]
      });
      setProductInput('');
    }
  };

  const handleRemoveProduct = (product) => {
    setFormData({
      ...formData,
      products_available: formData.products_available.filter(p => p !== product)
    });
  };

  const handleAddCrop = () => {
    if (cropInput.trim() && !formData.crop_association.includes(cropInput.trim())) {
      setFormData({
        ...formData,
        crop_association: [...formData.crop_association, cropInput.trim()]
      });
      setCropInput('');
    }
  };

  const handleRemoveCrop = (crop) => {
    setFormData({
      ...formData,
      crop_association: formData.crop_association.filter(c => c !== crop)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const url = supplier 
        ? `${API_BASE_URL}/api/suppliers/${supplier.id}`
        : `${API_BASE_URL}/api/suppliers`;
      
      const method = supplier ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert(supplier ? 'Supplier updated successfully!' : 'Supplier added successfully!');
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to save supplier');
      }
    } catch (error) {
      console.error('Error saving supplier:', error);
      alert('Failed to save supplier');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {supplier ? 'Edit Supplier' : 'Add New Supplier'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter supplier name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="District, State"
                />
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Contact Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="+91 98765 43210"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Full address"
                  rows="2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://www.example.com"
                />
              </div>
            </div>

            {/* Products */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Products Available *</h3>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={productInput}
                  onChange={(e) => setProductInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddProduct())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter product name"
                />
                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add
                </button>
              </div>

              {errors.products && <p className="text-red-500 text-sm">{errors.products}</p>}

              <div className="flex flex-wrap gap-2">
                {formData.products_available.map((product, idx) => (
                  <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2">
                    {product}
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(product)}
                      className="text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Crop Association */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Crop Specialization (Optional)</h3>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cropInput}
                  onChange={(e) => setCropInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCrop())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter crop name"
                />
                <button
                  type="button"
                  onClick={handleAddCrop}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.crop_association.map((crop, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2">
                    {crop}
                    <button
                      type="button"
                      onClick={() => handleRemoveCrop(crop)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : (supplier ? 'Update Supplier' : 'Add Supplier')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const SupplierCard = ({ supplier, onContactClick, onEmailClick, onEdit, onDelete, currentUser }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 mb-1">{supplier.name}</h3>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MapPin size={16} />
              <span>{supplier.location}</span>
            </div>
          </div>
          
          {supplier.rating && (
            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-semibold text-gray-900">{supplier.rating}</span>
            </div>
          )}
        </div>

        {/* Products */}
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">Available Products:</p>
          <div className="flex flex-wrap gap-2">
            {supplier.products_available.slice(0, 3).map((product, idx) => (
              <span key={idx} className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs">
                {product}
              </span>
            ))}
            {supplier.products_available.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                +{supplier.products_available.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
          {supplier.contact_info.phone && (
            <button
              onClick={() => onContactClick(supplier.contact_info.phone)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 w-full"
            >
              <Phone size={16} />
              <span>{supplier.contact_info.phone}</span>
            </button>
          )}
          
          {supplier.contact_info.email && (
            <button
              onClick={() => onEmailClick(supplier.contact_info.email)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600 w-full"
            >
              <Mail size={16} />
              <span className="truncate">{supplier.contact_info.email}</span>
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700"
          >
            {showDetails ? 'Hide Details' : 'View Details'}
          </button>
          
          <button
            onClick={() => onContactClick(supplier.contact_info.phone)}
            className="px-4 py-2 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50"
          >
            <Phone size={18} />
          </button>

          {currentUser?.role === 'specialist' && (
            <>
              <button
                onClick={() => onEdit(supplier)}
                className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={() => onDelete(supplier.id)}
                className="px-4 py-2 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50"
              >
                <Trash2 size={18} />
              </button>
            </>
          )}
        </div>

        {/* Expanded Details */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">All Products:</p>
              <div className="flex flex-wrap gap-2">
                {supplier.products_available.map((product, idx) => (
                  <span key={idx} className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs">
                    {product}
                  </span>
                ))}
              </div>
            </div>

            {supplier.crop_association && supplier.crop_association.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Crop Specialization:</p>
                <div className="flex flex-wrap gap-2">
                  {supplier.crop_association.map((crop, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {supplier.contact_info.address && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Address:</p>
                <p className="text-sm text-gray-600">{supplier.contact_info.address}</p>
              </div>
            )}

            {supplier.contact_info.website && (
              <div>
                <a
                  href={supplier.contact_info.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-600 hover:underline"
                >
                  Visit Website →
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuppliersPage;