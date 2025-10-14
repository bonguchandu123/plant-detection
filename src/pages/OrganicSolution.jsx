import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, X, TrendingUp, DollarSign, Star, Users, 
  ChevronRight, AlertCircle, Edit, Trash2, Image as ImageIcon, Save, Check,
  Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:8000/api';

// ============= TRANSLATION SYSTEM =============
const translations = {
  english: {
    // Page titles
    organicSolutions: "Organic Solutions",
    naturalFarmingRemedies: "Natural farming remedies and treatments",
    createNewSolution: "Create New Solution",
    editSolution: "Edit Solution",
    
    // Buttons
    back: "Back",
    addSolution: "Add Solution",
    seedSampleData: "Seed Sample Data",
    seeding: "Seeding...",
    search: "Search",
    filters: "Filters",
    viewDetails: "View Details",
    apply: "Apply",
    applyThisSolution: "Apply This Solution",
    applying: "Applying...",
    edit: "Edit",
    delete: "Delete",
    deleting: "Deleting...",
    cancel: "Cancel",
    createSolution: "Create Solution",
    updateSolution: "Update Solution",
    creating: "Creating...",
    updating: "Updating...",
    
    // Form labels
    solutionTitle: "Solution Title",
    description: "Description",
    category: "Category",
    successRate: "Success Rate (%)",
    costPerAcre: "Cost per Acre (₹)",
    preparationTime: "Preparation Time",
    applicationMethod: "Application Method",
    applicationFrequency: "Application Frequency",
    solutionImage: "Solution Image",
    clickToUpload: "Click to upload image",
    pngJpgUpTo10MB: "PNG, JPG up to 10MB",
    
    // Categories
    allCategories: "All Categories",
    pesticide: "Pesticide",
    fungicide: "Fungicide",
    fertilizer: "Fertilizer",
    growthPromoter: "Growth Promoter",
    
    // Filter labels
    minSuccess: "Min Success %",
    maxCost: "Max Cost",
    
    // Stats labels
    success: "Success",
    successRateLabel: "Success Rate",
    costAcre: "Cost/Acre",
    rating: "Rating",
    applications: "Applications",
    
    // Details page
    backToSolutions: "Back to Solutions",
    ingredients: "Ingredients",
    preparationSteps: "Preparation Steps",
    diseasesTreated: "Diseases Treated",
    suitableForCrops: "Suitable For Crops",
    precautions: "Precautions",
    
    // Messages
    noSolutionsFound: "No solutions found",
    uploadingImage: "Uploading image...",
    imageUploaded: "Image uploaded successfully!",
    uploadFailed: "Failed to upload image",
    createdSuccessfully: "Created successfully!",
    updatedSuccessfully: "Updated successfully!",
    deletedSuccessfully: "Deleted successfully!",
    appliedSuccessfully: "✅ Solution applied successfully! Check your dashboard for updated metrics.",
    failedToApply: "❌ Failed to apply solution",
    confirmDelete: "Are you sure you want to delete this solution? This action cannot be undone.",
    
    // Placeholders
    searchPlaceholder: "Search solutions...",
    titlePlaceholder: "e.g., Neem Oil Spray",
    descriptionPlaceholder: "Describe the solution and its benefits",
    preparationTimePlaceholder: "30 minutes",
    applicationMethodPlaceholder: "Foliar spray",
    applicationFrequencyPlaceholder: "Once every 7-10 days",
  },
  telugu: {
    // Page titles
    organicSolutions: "సేంద్రీయ పరిష్కారాలు",
    naturalFarmingRemedies: "సహజ వ్యవసాయ చికిత్సలు మరియు పరిష్కారాలు",
    createNewSolution: "కొత్త పరిష్కారాన్ని సృష్టించండి",
    editSolution: "పరిష్కారాన్ని సవరించండి",
    
    // Buttons
    back: "వెనక్కి",
    addSolution: "పరిష్కారాన్ని జోడించండి",
    seedSampleData: "నమూనా డేటా జోడించండి",
    seeding: "జోడిస్తోంది...",
    search: "వెతకండి",
    filters: "ఫిల్టర్లు",
    viewDetails: "వివరాలు చూడండి",
    apply: "వర్తింపజేయండి",
    applyThisSolution: "ఈ పరిష్కారాన్ని వర్తింపజేయండి",
    applying: "వర్తింపజేస్తోంది...",
    edit: "సవరించు",
    delete: "తొలగించు",
    deleting: "తొలగిస్తోంది...",
    cancel: "రద్దు చేయి",
    createSolution: "పరిష్కారాన్ని సృష్టించండి",
    updateSolution: "పరిష్కారాన్ని నవీకరించండి",
    creating: "సృష్టిస్తోంది...",
    updating: "నవీకరిస్తోంది...",
    
    // Form labels
    solutionTitle: "పరిష్కారం పేరు",
    description: "వివరణ",
    category: "వర్గం",
    successRate: "విజయ రేటు (%)",
    costPerAcre: "ఎకరాకు ఖర్చు (₹)",
    preparationTime: "తయారీ సమయం",
    applicationMethod: "వర్తింపు పద్ధతి",
    applicationFrequency: "వర్తింపు తరచుదనం",
    solutionImage: "పరిష్కారం చిత్రం",
    clickToUpload: "చిత్రాన్ని అప్‌లోడ్ చేయడానికి క్లిక్ చేయండి",
    pngJpgUpTo10MB: "PNG, JPG గరిష్టంగా 10MB",
    
    // Categories
    allCategories: "అన్ని వర్గాలు",
    pesticide: "పురుగుమందు",
    fungicide: "శిలీంద్రనాశిని",
    fertilizer: "ఎరువు",
    growthPromoter: "పెరుగుదల ప్రమోటర్",
    
    // Filter labels
    minSuccess: "కనీస విజయం %",
    maxCost: "గరిష్ట ఖర్చు",
    
    // Stats labels
    success: "విజయం",
    successRateLabel: "విజయ రేటు",
    costAcre: "ఖర్చు/ఎకరా",
    rating: "రేటింగ్",
    applications: "వర్తింపులు",
    
    // Details page
    backToSolutions: "పరిష్కారాలకు తిరిగి వెళ్ళండి",
    ingredients: "పదార్థాలు",
    preparationSteps: "తయారీ దశలు",
    diseasesTreated: "చికిత్స చేసే వ్యాధులు",
    suitableForCrops: "తగిన పంటలు",
    precautions: "జాగ్రత్తలు",
    
    // Messages
    noSolutionsFound: "పరిష్కారాలు కనుగొనబడలేదు",
    uploadingImage: "చిత్రం అప్‌లోడ్ అవుతోంది...",
    imageUploaded: "చిత్రం విజయవంతంగా అప్‌లోడ్ చేయబడింది!",
    uploadFailed: "చిత్రం అప్‌లోడ్ చేయడంలో విఫలమైంది",
    createdSuccessfully: "విజయవంతంగా సృష్టించబడింది!",
    updatedSuccessfully: "విజయవంతంగా నవీకరించబడింది!",
    deletedSuccessfully: "విజయవంతంగా తొలగించబడింది!",
    appliedSuccessfully: "✅ పరిష్కారం విజయవంతంగా వర్తింపజేయబడింది! నవీకరించబడిన మెట్రిక్స్ కోసం మీ డాష్‌బోర్డ్ తనిఖీ చేయండి.",
    failedToApply: "❌ పరిష్కారాన్ని వర్తింపజేయడం విఫలమైంది",
    confirmDelete: "మీరు ఖచ్చితంగా ఈ పరిష్కారాన్ని తొలగించాలనుకుంటున్నారా? ఈ చర్య రద్దు చేయబడదు.",
    
    // Placeholders
    searchPlaceholder: "పరిష్కారాలను వెతకండి...",
    titlePlaceholder: "ఉదా., వేప నూనె స్ప్రే",
    descriptionPlaceholder: "పరిష్కారం మరియు దాని ప్రయోజనాలను వివరించండి",
    preparationTimePlaceholder: "30 నిమిషాలు",
    applicationMethodPlaceholder: "ఆకుల స్ప్రే",
    applicationFrequencyPlaceholder: "ప్రతి 7-10 రోజులకు ఒకసారి",
  }
};

// Translation hook
const useTranslation = () => {
  const { user } = useAuth();
  const [language, setLanguage] = useState('telugu');
  
  useEffect(() => {
    const userLang = user?.language_preference || 'telugu';
    setLanguage(userLang === 'english' ? 'english' : 'telugu');
  }, [user]);
  
  const t = (key) => {
    return translations[language][key] || key;
  };
  
  return { t, language, setLanguage };
};

// ============= IMAGE UPLOAD COMPONENT =============
function ImageUpload({ onImageUploaded, currentImage }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || null);
  const { getToken } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    setPreview(currentImage);
  }, [currentImage]);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(t('uploadFailed'));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert(t('uploadFailed'));
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
      alert(t('imageUploaded'));
    } catch (error) {
      console.error('Upload error:', error);
      alert(t('uploadFailed'));
      setPreview(currentImage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{t('solutionImage')}</label>
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
            <span className="text-sm text-gray-600 mb-1">{t('clickToUpload')}</span>
            <span className="text-xs text-gray-400">{t('pngJpgUpTo10MB')}</span>
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

// ============= CREATE/EDIT FORM =============
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
  const { t } = useTranslation();

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

      alert(editMode ? t('updatedSuccessfully') : t('createdSuccessfully'));
      onBack();
    } catch (error) {
      console.error('Error:', error);
      alert(`${editMode ? t('updating') : t('creating')}: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const categoryOptions = [
    { value: 'pesticide', label: t('pesticide') },
    { value: 'fungicide', label: t('fungicide') },
    { value: 'fertilizer', label: t('fertilizer') },
    { value: 'growth_promoter', label: t('growthPromoter') }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600 mb-4 hover:text-gray-900">
        <ChevronRight size={20} className="rotate-180" />{t('back')}
      </button>
      <h1 className="text-3xl font-bold mb-6">
        {editMode ? t('editSolution') : t('createNewSolution')}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <ImageUpload
            currentImage={formData.image_url}
            onImageUploaded={(url) => setFormData({...formData, image_url: url})}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('solutionTitle')} *</label>
            <input 
              type="text" 
              required 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" 
              placeholder={t('titlePlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('description')} *</label>
            <textarea 
              required 
              rows="4" 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" 
              placeholder={t('descriptionPlaceholder')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('category')} *</label>
              <select 
                required 
                value={formData.category} 
                onChange={(e) => setFormData({...formData, category: e.target.value})} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              >
                {categoryOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('successRate')} *</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('costPerAcre')} *</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('preparationTime')} *</label>
              <input 
                type="text" 
                required 
                value={formData.preparation_time} 
                onChange={(e) => setFormData({...formData, preparation_time: e.target.value})} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" 
                placeholder={t('preparationTimePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('applicationMethod')} *</label>
              <input 
                type="text" 
                required 
                value={formData.application_method} 
                onChange={(e) => setFormData({...formData, application_method: e.target.value})} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" 
                placeholder={t('applicationMethodPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('applicationFrequency')} *</label>
              <input 
                type="text" 
                required 
                value={formData.application_frequency} 
                onChange={(e) => setFormData({...formData, application_frequency: e.target.value})} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500" 
                placeholder={t('applicationFrequencyPlaceholder')}
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
            {t('cancel')}
          </button>
          <button 
            type="submit" 
            disabled={submitting} 
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {submitting ? (editMode ? t('updating') : t('creating')) : (editMode ? t('updateSolution') : t('createSolution'))}
          </button>
        </div>
      </form>
    </div>
  );
}

// ============= DETAIL VIEW =============
function SolutionDetailView({ solutionId, onBack, onEdit, onDelete }) {
  const [solution, setSolution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [applying, setApplying] = useState(false);
  const { getToken, user } = useAuth();
  const { t } = useTranslation();
  const isSpecialist = user?.role === 'specialist';
  const isFarmer = user?.role === 'farmer';

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
        setSolution({ ...data, id: data._id || data.id });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('confirmDelete'))) return;

    try {
      setDeleting(true);
      const token = getToken();
      const response = await fetch(`${API_URL}/organic-solutions/${solutionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert(t('deletedSuccessfully'));
        onDelete();
      }
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleApplySolution = async () => {
    try {
      setApplying(true);
      const token = getToken();
      const response = await fetch(`${API_URL}/organic-solutions/${solutionId}/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          area_applied: 1.0,
          notes: "Applied from organic solutions page",
          location: user?.village || user?.district
        })
      });

      if (!response.ok) throw new Error('Failed to apply');

      alert(t('appliedSuccessfully'));
      fetchDetails();
    } catch (error) {
      console.error('Apply error:', error);
      alert(t('failedToApply'));
    } finally {
      setApplying(false);
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
    return <div className="text-center py-12">{t('noSolutionsFound')}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ChevronRight size={20} className="rotate-180" />{t('backToSolutions')}
        </button>
        
        <div className="flex gap-3">
          {isFarmer && (
            <button 
              onClick={handleApplySolution}
              disabled={applying}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 shadow-lg font-semibold"
            >
              <Check size={20} />
              {applying ? t('applying') : t('applyThisSolution')}
            </button>
          )}

          {isSpecialist && (
            <>
              <button 
                onClick={() => onEdit(solution)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit size={20} />{t('edit')}
              </button>
              <button 
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
              >
                <Trash2 size={20} />
                {deleting ? t('deleting') : t('delete')}
              </button>
            </>
          )}
        </div>
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
            <p className="text-sm text-gray-600">{t('successRateLabel')}</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <DollarSign size={24} className="mx-auto text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-blue-600">₹{solution.cost_per_acre}</p>
            <p className="text-sm text-gray-600">{t('costAcre')}</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <Star size={24} className="mx-auto text-yellow-600 mb-2" />
            <p className="text-2xl font-bold text-yellow-600">{solution.average_rating || 0}</p>
            <p className="text-sm text-gray-600">{t('rating')}</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Users size={24} className="mx-auto text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-purple-600">{solution.applications_count || 0}</p>
            <p className="text-sm text-gray-600">{t('applications')}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">{t('preparationTime')}</p>
            <p className="font-medium">{solution.preparation_time}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('applicationMethod')}</p>
            <p className="font-medium">{solution.application_method}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('applicationFrequency')}</p>
            <p className="font-medium">{solution.application_frequency}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('category')}</p>
            <p className="font-medium capitalize">{solution.category.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {solution.ingredients && solution.ingredients.length > 0 && (
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">{t('ingredients')}</h3>
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
          <h3 className="text-xl font-semibold mb-4">{t('preparationSteps')}</h3>
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
          <h3 className="text-xl font-semibold mb-4">{t('diseasesTreated')}</h3>
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
          <h3 className="text-xl font-semibold mb-4">{t('suitableForCrops')}</h3>
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
            {t('precautions')}
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

// ============= MAIN COMPONENT =============
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
  const { t, language, setLanguage } = useTranslation();
  const isSpecialist = user?.role === 'specialist';
  const isFarmer = user?.role === 'farmer';

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

  const handleQuickApply = async (e, solutionId) => {
    e.stopPropagation();
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/organic-solutions/${solutionId}/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          area_applied: 1.0,
          location: user?.village || user?.district
        })
      });
      
      if (response.ok) {
        alert(t('appliedSuccessfully'));
        fetchSolutions();
      } else {
        alert(t('failedToApply'));
      }
    } catch (err) {
      console.error(err);
      alert(t('failedToApply'));
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

  const toggleLanguage = async () => {
    const newLang = language === 'telugu' ? 'english' : 'telugu';
    setLanguage(newLang);
    
    // Update user preference in backend
    try {
      const token = getToken();
      await fetch(`${API_URL}/users/language`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ language: newLang })
      });
    } catch (error) {
      console.error('Error updating language:', error);
    }
  };

  const categoryOptions = [
    { value: '', label: t('allCategories') },
    { value: 'pesticide', label: t('pesticide') },
    { value: 'fungicide', label: t('fungicide') },
    { value: 'fertilizer', label: t('fertilizer') },
    { value: 'growth_promoter', label: t('growthPromoter') }
  ];

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
          <h1 className="text-3xl font-bold text-gray-900">{t('organicSolutions')}</h1>
          <p className="text-gray-600 mt-1">{t('naturalFarmingRemedies')}</p>
        </div>
        <div className="flex gap-3">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
            title={language === 'telugu' ? 'Switch to English' : 'తెలుగులోకి మార్చండి'}
          >
            <Globe size={20} />
            {language === 'telugu' ? 'EN' : 'తె'}
          </button>

          {isSpecialist && (
            <>
              <button 
                onClick={handleSeedData}
                disabled={seeding}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm disabled:bg-gray-400"
              >
                <Plus size={20} />
                {seeding ? t('seeding') : t('seedSampleData')}
              </button>
              <button 
                onClick={() => setShowCreateForm(true)} 
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 shadow-sm"
              >
                <Plus size={20} />{t('addSolution')}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4 space-y-4 shadow-sm">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button onClick={handleSearch} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            {t('search')}
          </button>
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <Filter size={20} />{t('filters')}
          </button>
        </div>

        {showFilters && (
          <div className="pt-4 border-t grid grid-cols-3 gap-4">
            <select 
              value={filters.category} 
              onChange={(e) => setFilters({...filters, category: e.target.value})} 
              className="px-3 py-2 border rounded-lg"
            >
              {categoryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <input 
              type="number" 
              placeholder={t('minSuccess')}
              value={filters.minSuccessRate} 
              onChange={(e) => setFilters({...filters, minSuccessRate: e.target.value})} 
              className="px-3 py-2 border rounded-lg" 
            />
            <input 
              type="number" 
              placeholder={t('maxCost')}
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
         
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {solutions.map((s) => (
            <div 
              key={s.id || s._id} 
              className="bg-white border rounded-lg overflow-hidden hover:border-green-500 transition-all hover:shadow-lg"
            >
              {s.image_url ? (
                <img 
                  src={s.image_url} 
                  alt={s.title} 
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() => setSelectedSolution(s.id || s._id)}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div 
                  className="w-full h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center cursor-pointer"
                  onClick={() => setSelectedSolution(s.id || s._id)}
                >
                  <ImageIcon size={48} className="text-green-400" />
                </div>
              )}
              <div className="p-5">
                <h3 
                  className="text-lg font-semibold mb-2 cursor-pointer hover:text-green-600"
                  onClick={() => setSelectedSolution(s.id || s._id)}
                >
                  {s.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{s.description}</p>
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-green-600 font-medium">{s.success_rate}% {t('success')}</span>
                  <span className="text-blue-600 font-medium">₹{s.cost_per_acre}/{language === 'telugu' ? 'ఎకరా' : 'acre'}</span>
                </div>
                <div className="mb-4 pb-4 border-b flex justify-between text-xs text-gray-500">
                  <span className="capitalize">{s.category.replace('_', ' ')}</span>
                  <span>{s.preparation_time}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedSolution(s.id || s._id)}
                    className="flex-1 px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 text-sm font-medium transition-colors"
                  >
                    {t('viewDetails')}
                  </button>
                  {isFarmer && (
                    <button
                      onClick={(e) => handleQuickApply(e, s.id || s._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors flex items-center gap-1"
                      title={t('applyThisSolution')}
                    >
                      <Check size={16} />
                      {t('apply')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}