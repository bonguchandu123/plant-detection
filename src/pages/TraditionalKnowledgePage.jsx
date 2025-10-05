import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, X, ChevronRight, AlertCircle, Edit, Trash2, 
  MapPin, Users, Calendar, Star, TrendingUp, Award, Leaf, BookOpen,
  CheckCircle, Clock, Target
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:8000/api';

// Create Practice Form
function CreatePracticeForm({ onBack, editMode = false, existingPractice = null }) {
  const [formData, setFormData] = useState(
    existingPractice || {
      title: '',
      description: '',
      category: 'planting',
      region: '',
      tribe_name: '',
      local_language: '',
      best_for_crops: [],
      season: 'all_seasons',
      implements_needed: [],
      duration: '',
      scientific_basis: '',
      difficulty_level: 'medium',
      verified_by_elders: false,
      elder_name: '',
      elder_contact: '',
      media_urls: [],
      video_urls: [],
      local_names: {}
    }
  );
  const [submitting, setSubmitting] = useState(false);
  const [cropInput, setCropInput] = useState('');
  const [implementInput, setImplementInput] = useState('');
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [localNameLang, setLocalNameLang] = useState('');
  const [localNameText, setLocalNameText] = useState('');
  const { getToken } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const token = getToken();
      
      const url = editMode 
        ? `${API_URL}/traditional-practices/${existingPractice.id}` 
        : `${API_URL}/traditional-practices`;
      
      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Operation failed');

      alert(editMode ? 'Updated successfully!' : 'Created successfully!');
      onBack();
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed to ${editMode ? 'update' : 'create'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const addCrop = () => {
    if (cropInput.trim()) {
      setFormData({
        ...formData,
        best_for_crops: [...formData.best_for_crops, cropInput.trim()]
      });
      setCropInput('');
    }
  };

  const removeCrop = (index) => {
    setFormData({
      ...formData,
      best_for_crops: formData.best_for_crops.filter((_, i) => i !== index)
    });
  };

  const addImplement = () => {
    if (implementInput.trim()) {
      setFormData({
        ...formData,
        implements_needed: [...formData.implements_needed, implementInput.trim()]
      });
      setImplementInput('');
    }
  };

  const removeImplement = (index) => {
    setFormData({
      ...formData,
      implements_needed: formData.implements_needed.filter((_, i) => i !== index)
    });
  };

  const addMediaUrl = () => {
    if (mediaUrlInput.trim()) {
      setFormData({
        ...formData,
        media_urls: [...(formData.media_urls || []), mediaUrlInput.trim()]
      });
      setMediaUrlInput('');
    }
  };

  const removeMediaUrl = (index) => {
    setFormData({
      ...formData,
      media_urls: formData.media_urls.filter((_, i) => i !== index)
    });
  };

  const addVideoUrl = () => {
    if (videoUrlInput.trim()) {
      setFormData({
        ...formData,
        video_urls: [...(formData.video_urls || []), videoUrlInput.trim()]
      });
      setVideoUrlInput('');
    }
  };

  const removeVideoUrl = (index) => {
    setFormData({
      ...formData,
      video_urls: formData.video_urls.filter((_, i) => i !== index)
    });
  };

  const addLocalName = () => {
    if (localNameLang.trim() && localNameText.trim()) {
      setFormData({
        ...formData,
        local_names: {
          ...(formData.local_names || {}),
          [localNameLang.trim()]: localNameText.trim()
        }
      });
      setLocalNameLang('');
      setLocalNameText('');
    }
  };

  const removeLocalName = (lang) => {
    const newLocalNames = { ...formData.local_names };
    delete newLocalNames[lang];
    setFormData({
      ...formData,
      local_names: newLocalNames
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 mb-4 hover:text-gray-900">
        <ChevronRight size={20} className="rotate-180" />Back
      </button>
      <h1 className="text-3xl font-bold mb-6">
        {editMode ? 'Edit Traditional Practice' : 'Add Traditional Practice'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Practice Title *</label>
            <input 
              type="text" 
              required 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" 
              placeholder="e.g., Moon Phase Planting"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea 
              required 
              rows="4" 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" 
              placeholder="Detailed description of the practice"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select 
                required 
                value={formData.category} 
                onChange={(e) => setFormData({...formData, category: e.target.value})} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="planting">Planting</option>
                <option value="pest_control">Pest Control</option>
                <option value="soil_management">Soil Management</option>
                <option value="water_conservation">Water Conservation</option>
                <option value="seed_treatment">Seed Treatment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Season *</label>
              <select 
                required 
                value={formData.season} 
                onChange={(e) => setFormData({...formData, season: e.target.value})} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all_seasons">All Seasons</option>
                <option value="kharif">Kharif</option>
                <option value="rabi">Rabi</option>
                <option value="summer">Summer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region *</label>
              <input 
                type="text" 
                required 
                value={formData.region} 
                onChange={(e) => setFormData({...formData, region: e.target.value})} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" 
                placeholder="e.g., Andhra Pradesh"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tribe Name</label>
              <input 
                type="text" 
                value={formData.tribe_name} 
                onChange={(e) => setFormData({...formData, tribe_name: e.target.value})} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" 
                placeholder="e.g., Koya Tribe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Local Language</label>
              <input 
                type="text" 
                value={formData.local_language} 
                onChange={(e) => setFormData({...formData, local_language: e.target.value})} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" 
                placeholder="e.g., Telugu, Koya"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level *</label>
              <select 
                required 
                value={formData.difficulty_level} 
                onChange={(e) => setFormData({...formData, difficulty_level: e.target.value})} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input 
                type="text" 
                value={formData.duration} 
                onChange={(e) => setFormData({...formData, duration: e.target.value})} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" 
                placeholder="e.g., 2-3 weeks"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Suitable Crops</label>
            <div className="flex gap-2 mb-2">
              <input 
                type="text" 
                value={cropInput} 
                onChange={(e) => setCropInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCrop())}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" 
                placeholder="Add crop and press Enter"
              />
              <button type="button" onClick={addCrop} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.best_for_crops.map((crop, idx) => (
                <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-2">
                  {crop}
                  <button type="button" onClick={() => removeCrop(idx)} className="text-purple-900 hover:text-purple-700">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Implements Needed</label>
            <div className="flex gap-2 mb-2">
              <input 
                type="text" 
                value={implementInput} 
                onChange={(e) => setImplementInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImplement())}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" 
                placeholder="Add implement and press Enter"
              />
              <button type="button" onClick={addImplement} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.implements_needed.map((impl, idx) => (
                <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-2">
                  {impl}
                  <button type="button" onClick={() => removeImplement(idx)} className="text-gray-900 hover:text-gray-700">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scientific Basis</label>
            <textarea 
              rows="3" 
              value={formData.scientific_basis} 
              onChange={(e) => setFormData({...formData, scientific_basis: e.target.value})} 
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" 
              placeholder="Modern scientific explanation of why this practice works"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Local Names (by Language)</label>
            <div className="flex gap-2 mb-2">
              <input 
                type="text" 
                value={localNameLang} 
                onChange={(e) => setLocalNameLang(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" 
                placeholder="Language (e.g., telugu, hindi)"
              />
              <input 
                type="text" 
                value={localNameText} 
                onChange={(e) => setLocalNameText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocalName())}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" 
                placeholder="Local name"
              />
              <button type="button" onClick={addLocalName} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Add
              </button>
            </div>
            {formData.local_names && Object.keys(formData.local_names).length > 0 && (
              <div className="space-y-1">
                {Object.entries(formData.local_names).map(([lang, name]) => (
                  <div key={lang} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm"><strong>{lang}:</strong> {name}</span>
                    <button type="button" onClick={() => removeLocalName(lang)} className="text-red-600 hover:text-red-800">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Media URLs (Images)</label>
            <div className="flex gap-2 mb-2">
              <input 
                type="url" 
                value={mediaUrlInput} 
                onChange={(e) => setMediaUrlInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMediaUrl())}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" 
                placeholder="https://example.com/image.jpg"
              />
              <button type="button" onClick={addMediaUrl} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Add
              </button>
            </div>
            {formData.media_urls && formData.media_urls.length > 0 && (
              <div className="space-y-1">
                {formData.media_urls.map((url, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm truncate flex-1">{url}</span>
                    <button type="button" onClick={() => removeMediaUrl(idx)} className="text-red-600 hover:text-red-800 ml-2">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video URLs (YouTube, etc.)</label>
            <div className="flex gap-2 mb-2">
              <input 
                type="url" 
                value={videoUrlInput} 
                onChange={(e) => setVideoUrlInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVideoUrl())}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" 
                placeholder="https://youtube.com/watch?v=..."
              />
              <button type="button" onClick={addVideoUrl} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Add
              </button>
            </div>
            {formData.video_urls && formData.video_urls.length > 0 && (
              <div className="space-y-1">
                {formData.video_urls.map((url, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm truncate flex-1">{url}</span>
                    <button type="button" onClick={() => removeVideoUrl(idx)} className="text-red-600 hover:text-red-800 ml-2">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <input 
                type="checkbox" 
                id="verified" 
                checked={formData.verified_by_elders}
                onChange={(e) => setFormData({...formData, verified_by_elders: e.target.checked})}
                className="w-4 h-4 text-purple-600"
              />
              <label htmlFor="verified" className="text-sm font-medium text-gray-700">
                Verified by Tribal Elders
              </label>
            </div>

            {formData.verified_by_elders && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Elder Name</label>
                  <input 
                    type="text" 
                    value={formData.elder_name} 
                    onChange={(e) => setFormData({...formData, elder_name: e.target.value})} 
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Elder Contact</label>
                  <input 
                    type="text" 
                    value={formData.elder_contact} 
                    onChange={(e) => setFormData({...formData, elder_contact: e.target.value})} 
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" 
                  />
                </div>
              </div>
            )}
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
            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
          >
            {submitting ? (editMode ? 'Updating...' : 'Creating...') : (editMode ? 'Update Practice' : 'Create Practice')}
          </button>
        </div>
      </form>
    </div>
  );
}

// Practice Detail View
function PracticeDetailView({ practiceId, onBack, onEdit, onDelete }) {
  const [practice, setPractice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const { getToken, user } = useAuth();
  const isSpecialist = user?.role === 'specialist';

  useEffect(() => {
    fetchDetails();
  }, [practiceId]);

  const fetchDetails = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/traditional-practices/${practiceId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPractice(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this practice?')) return;

    try {
      setDeleting(true);
      const token = getToken();
      const response = await fetch(`${API_URL}/traditional-practices/${practiceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Practice deleted successfully!');
        onDelete();
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!practice) {
    return <div className="text-center py-12">Practice not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ChevronRight size={20} className="rotate-180" />Back to Practices
        </button>
        
        <div className="flex gap-3">
          {!isSpecialist && (
            <button 
              onClick={() => setShowApplyModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <CheckCircle size={20} />Apply Practice
            </button>
          )}
          {isSpecialist && (
            <>
              <button 
                onClick={() => onEdit(practice)}
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
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{practice.title}</h1>
            <p className="text-gray-600 mb-4">{practice.description}</p>
          </div>
          {practice.verified_by_elders && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              <Award size={16} />
              Elder Verified
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Star size={24} className="mx-auto text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-purple-600">{practice.average_rating || 0}</p>
            <p className="text-sm text-gray-600">Rating</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <TrendingUp size={24} className="mx-auto text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-blue-600">{practice.success_rate || 0}%</p>
            <p className="text-sm text-gray-600">Success Rate</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Users size={24} className="mx-auto text-green-600 mb-2" />
            <p className="text-2xl font-bold text-green-600">{practice.applications_count || 0}</p>
            <p className="text-sm text-gray-600">Applications</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Target size={24} className="mx-auto text-orange-600 mb-2" />
            <p className="text-2xl font-bold text-orange-600 capitalize">{practice.difficulty_level}</p>
            <p className="text-sm text-gray-600">Difficulty</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t pt-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">Category</p>
            <p className="font-medium capitalize">{practice.category.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Season</p>
            <p className="font-medium capitalize">{practice.season.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Region</p>
            <p className="font-medium flex items-center gap-1">
              <MapPin size={16} className="text-gray-400" />
              {practice.region}
            </p>
          </div>
          {practice.tribe_name && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Tribe</p>
              <p className="font-medium">{practice.tribe_name}</p>
            </div>
          )}
          {practice.duration && (
            <div>
              <p className="text-sm text-gray-500 mb-1">Duration</p>
              <p className="font-medium flex items-center gap-1">
                <Clock size={16} className="text-gray-400" />
                {practice.duration}
              </p>
            </div>
          )}
        </div>
      </div>

      {practice.best_for_crops && practice.best_for_crops.length > 0 && (
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Leaf className="text-green-600" />
            Suitable For Crops
          </h3>
          <div className="flex flex-wrap gap-2">
            {practice.best_for_crops.map((crop, idx) => (
              <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                {crop}
              </span>
            ))}
          </div>
        </div>
      )}

      {practice.implements_needed && practice.implements_needed.length > 0 && (
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Implements Needed</h3>
          <div className="flex flex-wrap gap-2">
            {practice.implements_needed.map((impl, idx) => (
              <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                {impl}
              </span>
            ))}
          </div>
        </div>
      )}

      {practice.scientific_basis && (
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="text-blue-600" />
            Scientific Basis
          </h3>
          <p className="text-gray-700">{practice.scientific_basis}</p>
        </div>
      )}

      {practice.verified_by_elders && practice.elder_name && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-green-800">
            <Award className="text-green-600" />
            Elder Verification
          </h3>
          <p className="text-green-700">Verified by: <span className="font-medium">{practice.elder_name}</span></p>
          {practice.elder_contact && (
            <p className="text-green-600 text-sm mt-1">Contact: {practice.elder_contact}</p>
          )}
        </div>
      )}

      {practice.local_names && Object.keys(practice.local_names).length > 0 && (
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Local Names</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(practice.local_names).map(([lang, name]) => (
              <div key={lang} className="p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-600 uppercase font-semibold mb-1">{lang}</p>
                <p className="text-gray-900 font-medium">{name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {practice.media_urls && practice.media_urls.length > 0 && (
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Images & Media</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {practice.media_urls.map((url, idx) => (
              <div key={idx} className="relative group">
                <img 
                  src={url} 
                  alt={`Media ${idx + 1}`} 
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23ddd" width="100" height="100"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999">No Image</text></svg>';
                  }}
                />
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                >
                  <span className="text-white font-semibold">View Full Size</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {practice.video_urls && practice.video_urls.length > 0 && (
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Video Resources</h3>
          <div className="space-y-3">
            {practice.video_urls.map((url, idx) => (
              <a 
                key={idx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors group"
              >
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">Video {idx + 1}</p>
                  <p className="text-xs text-gray-500 truncate">{url}</p>
                </div>
                <ChevronRight className="text-gray-400 group-hover:text-red-600" size={20} />
              </a>
            ))}
          </div>
        </div>
      )}

      {practice.success_stories && practice.success_stories.length > 0 && (
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Success Stories</h3>
          <div className="space-y-4">
            {practice.success_stories.map((story, idx) => (
              <div key={idx} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="text-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{story.farmer_name}</p>
                    <p className="text-sm text-gray-600 mb-2">{story.location}</p>
                    <p className="text-gray-700">{story.result}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Main Component
export default function TraditionalKnowledgePage() {
  const [practices, setPractices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPractice, setEditingPractice] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ category: '', region: '', season: '', difficulty: '', verified_only: false });
  const [seeding, setSeeding] = useState(false);
  const { getToken, user } = useAuth();
  const isSpecialist = user?.role === 'specialist';

  useEffect(() => {
    fetchPractices();
  }, [filters]);

  const fetchPractices = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.region) params.append('region', filters.region);
      if (filters.season) params.append('season', filters.season);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.verified_only) params.append('verified_only', 'true');

      const response = await fetch(`${API_URL}/traditional-practices?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPractices(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchPractices();
      return;
    }
    try {
      const token = getToken();
      const response = await fetch(
        `${API_URL}/traditional-practices/search?query=${encodeURIComponent(searchQuery)}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setPractices(data);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleSeedData = async () => {
    if (!window.confirm('This will add sample traditional practices to the database. Continue?')) {
      return;
    }
    
    try {
      setSeeding(true);
      const token = getToken();
      const response = await fetch(`${API_URL}/admin/seed-traditional-practices`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        alert('Sample data seeded successfully!');
        fetchPractices();
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

  const handleEdit = (practice) => {
    setEditingPractice(practice);
    setSelectedPractice(null);
  };

  const handleDeleteSuccess = () => {
    setSelectedPractice(null);
    fetchPractices();
  };

  const handleFormClose = () => {
    setShowCreateForm(false);
    setEditingPractice(null);
    fetchPractices();
  };

  if (showCreateForm || editingPractice) {
    return (
      <CreatePracticeForm 
        onBack={handleFormClose}
        editMode={!!editingPractice}
        existingPractice={editingPractice}
      />
    );
  }

  if (selectedPractice) {
    return (
      <PracticeDetailView 
        practiceId={selectedPractice} 
        onBack={() => setSelectedPractice(null)}
        onEdit={handleEdit}
        onDelete={handleDeleteSuccess}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Traditional Knowledge</h1>
          <p className="text-gray-600 mt-1">Ancient farming wisdom from tribal communities</p>
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
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 shadow-sm"
            >
              <Plus size={20} />Add Practice
            </button>
          </div>
        )}
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
        <p className="text-purple-900 font-semibold mb-2">
          Ancient farming wisdom passed down through generations
        </p>
        <p className="text-purple-800 text-sm">
          These practices have been used by tribal communities for centuries and are proven to work in harmony with nature.
        </p>
      </div>

      <div className="bg-white rounded-lg border p-4 space-y-4 shadow-sm">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search practices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button onClick={handleSearch} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
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
          <div className="pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
            <select 
              value={filters.category} 
              onChange={(e) => setFilters({...filters, category: e.target.value})} 
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">All Categories</option>
              <option value="planting">Planting</option>
              <option value="pest_control">Pest Control</option>
              <option value="soil_management">Soil Management</option>
              <option value="water_conservation">Water Conservation</option>
              <option value="seed_treatment">Seed Treatment</option>
            </select>
            <select 
              value={filters.season} 
              onChange={(e) => setFilters({...filters, season: e.target.value})} 
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">All Seasons</option>
              <option value="all_seasons">All Seasons</option>
              <option value="kharif">Kharif</option>
              <option value="rabi">Rabi</option>
              <option value="summer">Summer</option>
            </select>
            <select 
              value={filters.difficulty} 
              onChange={(e) => setFilters({...filters, difficulty: e.target.value})} 
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <input 
              type="text" 
              placeholder="Region" 
              value={filters.region} 
              onChange={(e) => setFilters({...filters, region: e.target.value})} 
              className="px-3 py-2 border rounded-lg" 
            />
            <div className="flex items-center gap-2 col-span-2">
              <input 
                type="checkbox" 
                id="verified" 
                checked={filters.verified_only}
                onChange={(e) => setFilters({...filters, verified_only: e.target.checked})}
                className="w-4 h-4 text-purple-600"
              />
              <label htmlFor="verified" className="text-sm text-gray-700">
                Show only Elder Verified practices
              </label>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : practices.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border shadow-sm">
          <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">No practices found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {practices.map((p) => (
            <div 
              key={p.id} 
              onClick={() => setSelectedPractice(p.id)} 
              className="bg-white border rounded-lg overflow-hidden hover:border-purple-500 cursor-pointer transition-all hover:shadow-lg"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold flex-1">{p.title}</h3>
                  {p.verified_by_elders && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      <Award size={12} />
                      Verified
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{p.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin size={16} className="text-purple-500" />
                    <span>{p.region}</span>
                  </div>
                  {p.tribe_name && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users size={16} className="text-purple-500" />
                      <span>{p.tribe_name}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs capitalize">
                    {p.category.replace('_', ' ')}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs capitalize">
                    {p.season.replace('_', ' ')}
                  </span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs capitalize">
                    {p.difficulty_level}
                  </span>
                </div>

                {p.best_for_crops && p.best_for_crops.length > 0 && (
                  <div className="pt-3 border-t">
                    <p className="text-xs text-gray-500 mb-1">Best for:</p>
                    <div className="flex flex-wrap gap-1">
                      {p.best_for_crops.slice(0, 3).map((crop, idx) => (
                        <span key={idx} className="text-xs text-green-600">
                          {crop}{idx < Math.min(2, p.best_for_crops.length - 1) ? ',' : ''}
                        </span>
                      ))}
                      {p.best_for_crops.length > 3 && (
                        <span className="text-xs text-gray-400">+{p.best_for_crops.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}