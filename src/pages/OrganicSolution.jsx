import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, X, TrendingUp, DollarSign, Star, Users, 
  ChevronRight, AlertCircle, Edit, Trash2, Image as ImageIcon, Save 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';


const API_URL = 'http://localhost:8000/api';

// Auth Hook (assuming this exists)


// Image Upload Component
function ImageUpload({ onImageUploaded, currentImage }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || null);
  const { getToken } = useAuth();

  useEffect(() => {
    setPreview(currentImage);
  }, [currentImage]);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setPreview(URL.createObjectURL(file));

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const token = getToken();
      const response = await fetch(`${API_URL}/organic-solutions/upload-image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      onImageUploaded(data.image_url);
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
      setPreview(currentImage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Solution Image</label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 relative">
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
            <button
              type="button"
              onClick={() => { setPreview(null); onImageUploaded(null); }}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center cursor-pointer py-8">
            <ImageIcon size={48} className="text-gray-400 mb-2" />
            <span className="text-sm text-gray-600 mb-1">Click to upload image</span>
            <span className="text-xs text-gray-400">PNG, JPG up to 10MB</span>
            <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          </label>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        )}
      </div>
    </div>
  );
}

// Create Solution Form
function CreateSolutionForm({ onBack, editMode = false, existingSolution = null }) {
  const [formData, setFormData] = useState(
    existingSolution || {
      title: '', 
      description: '', 
      category: 'pesticide', 
      success_rate: '', 
      cost_per_acre: '',
      preparation_time: '', 
      application_method: '', 
      application_frequency: '',
      image_url: null
    }
  );
  const [submitting, setSubmitting] = useState(false);
  const { getToken } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const token = getToken();
      
      const payload = {
        ...formData,
        success_rate: parseFloat(formData.success_rate),
        cost_per_acre: parseFloat(formData.cost_per_acre),
        ingredients: formData.ingredients || [],
        preparation_steps: formData.preparation_steps || [],
        diseases_treated: formData.diseases_treated || [],
        crops_suitable_for: formData.crops_suitable_for || [],
        precautions: formData.precautions || []
      };

      const url = editMode 
        ? `${API_URL}/organic-solutions/${existingSolution.id || existingSolution._id}` 
        : `${API_URL}/organic-solutions`;
      
      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Operation failed');
      }

      alert(editMode ? 'Updated successfully!' : 'Created successfully!');
      onBack();
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed to ${editMode ? 'update' : 'create'}: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 mb-4 hover:text-gray-900">
        <ChevronRight size={20} className="rotate-180" />Back
      </button>
      <h1 className="text-3xl font-bold mb-6">
        {editMode ? 'Edit Solution' : 'Create New Solution'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <ImageUpload
            currentImage={formData.image_url}
            onImageUploaded={(url) => setFormData({...formData, image_url: url})}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Solution Title *</label>
            <input 
              type="text" 
              required 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" 
              placeholder="e.g., Neem Oil Spray" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea 
              required 
              rows="4" 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" 
              placeholder="Describe the solution and its benefits" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select 
                required 
                value={formData.category} 
                onChange={(e) => setFormData({...formData, category: e.target.value})} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="pesticide">Pesticide</option>
                <option value="fungicide">Fungicide</option>
                <option value="fertilizer">Fertilizer</option>
                <option value="growth_promoter">Growth Promoter</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Success Rate (%) *</label>
              <input 
                type="number" 
                required 
                min="0" 
                max="100" 
                value={formData.success_rate} 
                onChange={(e) => setFormData({...formData, success_rate: e.target.value})} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" 
                placeholder="85" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost per Acre (₹) *</label>
              <input 
                type="number" 
                required 
                min="0" 
                value={formData.cost_per_acre} 
                onChange={(e) => setFormData({...formData, cost_per_acre: e.target.value})} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" 
                placeholder="150" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preparation Time *</label>
              <input 
                type="text" 
                required 
                value={formData.preparation_time} 
                onChange={(e) => setFormData({...formData, preparation_time: e.target.value})} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" 
                placeholder="30 minutes" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Application Method *</label>
              <input 
                type="text" 
                required 
                value={formData.application_method} 
                onChange={(e) => setFormData({...formData, application_method: e.target.value})} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" 
                placeholder="Foliar spray" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Application Frequency *</label>
              <input 
                type="text" 
                required 
                value={formData.application_frequency} 
                onChange={(e) => setFormData({...formData, application_frequency: e.target.value})} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" 
                placeholder="Once every 7-10 days" 
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            type="button" 
            onClick={onBack} 
            className="flex-1 px-6 py-3 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={submitting} 
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {submitting ? (editMode ? 'Updating...' : 'Creating...') : (editMode ? 'Update Solution' : 'Create Solution')}
          </button>
        </div>
      </form>
    </div>
  );
}

// Solution Detail View
function SolutionDetailView({ solutionId, onBack, onEdit, onDelete }) {
  const [solution, setSolution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const { getToken, user } = useAuth();
  const isSpecialist = user?.role === 'specialist';

  useEffect(() => {
    fetchDetails();
  }, [solutionId]);

  const fetchDetails = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/organic-solutions/${solutionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Transform _id to id for consistency
        const transformedData = {
          ...data,
          id: data._id || data.id
        };
        setSolution(transformedData);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this solution? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      const token = getToken();
      const response = await fetch(`${API_URL}/organic-solutions/${solutionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Solution deleted successfully!');
        onDelete();
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!solution) {
    return <div className="text-center py-12">Solution not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ChevronRight size={20} className="rotate-180" />Back to Solutions
        </button>
        
        {isSpecialist && (
          <div className="flex gap-3">
            <button 
              onClick={() => onEdit(solution)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit size={20} />Edit
            </button>
            <button 
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
            >
              <Trash2 size={20} />
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}
      </div>

      {solution.image_url && (
        <div className="bg-white rounded-lg border overflow-hidden shadow-sm">
          <img src={solution.image_url} alt={solution.title} className="w-full h-96 object-cover" />
        </div>
      )}

      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h1 className="text-3xl font-bold mb-2">{solution.title}</h1>
        <p className="text-gray-600 mb-6">{solution.description}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <TrendingUp size={24} className="mx-auto text-green-600 mb-2" />
            <p className="text-2xl font-bold text-green-600">{solution.success_rate}%</p>
            <p className="text-sm text-gray-600">Success Rate</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <DollarSign size={24} className="mx-auto text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-blue-600">₹{solution.cost_per_acre}</p>
            <p className="text-sm text-gray-600">Cost/Acre</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <Star size={24} className="mx-auto text-yellow-600 mb-2" />
            <p className="text-2xl font-bold text-yellow-600">{solution.average_rating || 0}</p>
            <p className="text-sm text-gray-600">Rating</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Users size={24} className="mx-auto text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-purple-600">{solution.applications_count || 0}</p>
            <p className="text-sm text-gray-600">Applications</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Preparation Time</p>
            <p className="font-medium">{solution.preparation_time}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Application Method</p>
            <p className="font-medium">{solution.application_method}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Application Frequency</p>
            <p className="font-medium">{solution.application_frequency}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Category</p>
            <p className="font-medium capitalize">{solution.category.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {solution.ingredients && solution.ingredients.length > 0 && (
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Ingredients</h3>
          <div className="space-y-2">
            {solution.ingredients.map((ing, idx) => (
              <div key={idx} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{ing.name}</p>
                  {ing.local_name && <p className="text-sm text-gray-600">{ing.local_name}</p>}
                </div>
                <p className="font-medium text-green-600">{ing.quantity}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {solution.preparation_steps && solution.preparation_steps.length > 0 && (
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Preparation Steps</h3>
          <div className="space-y-4">
            {solution.preparation_steps.map((step, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                  {idx + 1}
                </div>
                <p className="pt-1 text-gray-700">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {solution.diseases_treated && solution.diseases_treated.length > 0 && (
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Diseases Treated</h3>
          <div className="flex flex-wrap gap-2">
            {solution.diseases_treated.map((disease, idx) => (
              <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                {disease}
              </span>
            ))}
          </div>
        </div>
      )}

      {solution.crops_suitable_for && solution.crops_suitable_for.length > 0 && (
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Suitable For Crops</h3>
          <div className="flex flex-wrap gap-2">
            {solution.crops_suitable_for.map((crop, idx) => (
              <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                {crop}
              </span>
            ))}
          </div>
        </div>
      )}

      {solution.precautions && solution.precautions.length > 0 && (
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="text-orange-500" />
            Precautions
          </h3>
          <ul className="space-y-2">
            {solution.precautions.map((precaution, idx) => (
              <li key={idx} className="flex gap-2 text-gray-700">
                <span className="text-orange-500">⚠️</span>
                {precaution}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Main Component
export default function OrganicSolutionsPage() {
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSolution, setEditingSolution] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ category: '', minSuccessRate: '', maxCost: '' });
  const [seeding, setSeeding] = useState(false);
  const { getToken, user } = useAuth();
  const isSpecialist = user?.role === 'specialist';

  useEffect(() => {
    fetchSolutions();
  }, [filters]);

  const fetchSolutions = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.minSuccessRate) params.append('min_success_rate', filters.minSuccessRate);
      if (filters.maxCost) params.append('max_cost', filters.maxCost);

      const response = await fetch(`${API_URL}/organic-solutions?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Transform _id to id for easier frontend handling
        const transformedData = data.map(item => ({
          ...item,
          id: item._id || item.id
        }));
        setSolutions(transformedData);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchSolutions();
      return;
    }
    try {
      const token = getToken();
      const response = await fetch(
        `${API_URL}/organic-solutions/search?query=${encodeURIComponent(searchQuery)}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        // Transform _id to id for easier frontend handling
        const transformedData = data.map(item => ({
          ...item,
          id: item._id || item.id
        }));
        setSolutions(transformedData);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleSeedData = async () => {
    if (!window.confirm('This will add sample organic solutions to the database. Continue?')) {
      return;
    }
    
    try {
      setSeeding(true);
      const token = getToken();
      const response = await fetch(`${API_URL}/admin/seed-organic-solutions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        alert('Sample data seeded successfully!');
        fetchSolutions();
      } else {
        const error = await response.json();
        alert('Failed to seed data: ' + (error.detail || 'Unknown error'));
      }
    } catch (error) {
      console.error('Seed error:', error);
      alert('Failed to seed data');
    } finally {
      setSeeding(false);
    }
  };

  const handleEdit = (solution) => {
    setEditingSolution(solution);
    setSelectedSolution(null);
  };

  const handleDeleteSuccess = () => {
    setSelectedSolution(null);
    fetchSolutions();
  };

  const handleFormClose = () => {
    setShowCreateForm(false);
    setEditingSolution(null);
    fetchSolutions();
  };

  if (showCreateForm || editingSolution) {
    return (
      <CreateSolutionForm 
        onBack={handleFormClose}
        editMode={!!editingSolution}
        existingSolution={editingSolution}
      />
    );
  }

  if (selectedSolution) {
    return (
      <SolutionDetailView 
        solutionId={selectedSolution} 
        onBack={() => setSelectedSolution(null)}
        onEdit={handleEdit}
        onDelete={handleDeleteSuccess}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organic Solutions</h1>
          <p className="text-gray-600 mt-1">Natural farming remedies and treatments</p>
        </div>
        {isSpecialist && (
          <div className="flex gap-3">
            <button 
              onClick={handleSeedData}
              disabled={seeding}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm disabled:bg-gray-400"
            >
              <Plus size={20} />
              {seeding ? 'Seeding...' : 'Seed Sample Data'}
            </button>
            <button 
              onClick={() => setShowCreateForm(true)} 
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 shadow-sm"
            >
              <Plus size={20} />Add Solution
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border p-4 space-y-4 shadow-sm">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search solutions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button onClick={handleSearch} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Search
          </button>
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <Filter size={20} />Filters
          </button>
        </div>

        {showFilters && (
          <div className="pt-4 border-t grid grid-cols-3 gap-4">
            <select 
              value={filters.category} 
              onChange={(e) => setFilters({...filters, category: e.target.value})} 
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">All Categories</option>
              <option value="pesticide">Pesticide</option>
              <option value="fungicide">Fungicide</option>
              <option value="fertilizer">Fertilizer</option>
              <option value="growth_promoter">Growth Promoter</option>
            </select>
            <input 
              type="number" 
              placeholder="Min Success %" 
              value={filters.minSuccessRate} 
              onChange={(e) => setFilters({...filters, minSuccessRate: e.target.value})} 
              className="px-3 py-2 border rounded-lg" 
            />
            <input 
              type="number" 
              placeholder="Max Cost" 
              value={filters.maxCost} 
              onChange={(e) => setFilters({...filters, maxCost: e.target.value})} 
              className="px-3 py-2 border rounded-lg" 
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : solutions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border shadow-sm">
          <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">No solutions found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {solutions.map((s) => (
            <div 
              key={s.id || s._id} 
              onClick={() => setSelectedSolution(s.id || s._id)} 
              className="bg-white border rounded-lg overflow-hidden hover:border-green-500 cursor-pointer transition-all hover:shadow-lg"
            >
              {s.image_url ? (
                <img 
                  src={s.image_url} 
                  alt={s.title} 
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                  <ImageIcon size={48} className="text-green-400" />
                </div>
              )}
              <div className="p-5">
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{s.description}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 font-medium">{s.success_rate}% Success</span>
                  <span className="text-blue-600 font-medium">₹{s.cost_per_acre}/acre</span>
                </div>
                <div className="mt-3 pt-3 border-t flex justify-between text-xs text-gray-500">
                  <span className="capitalize">{s.category.replace('_', ' ')}</span>
                  <span>{s.preparation_time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}