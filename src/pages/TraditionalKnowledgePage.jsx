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
  const [applyingPracticeId, setApplyingPracticeId] = useState(null);
  const [language, setLanguage] = useState('en');
  const { getToken, user } = useAuth();
  const isSpecialist = user?.role === 'specialist';
  const isFarmer = user?.role === 'farmer';
  const t = translations[language];

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

  const handleQuickApply = async (e, practiceId) => {
    e.stopPropagation();
    try {
      setApplyingPracticeId(practiceId);
      const token = getToken();
      const response = await fetch(`${API_URL}/traditional-practices/${practiceId}/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location: user?.village || user?.district,
          notes: "Applied from traditional practices page"
        })
      });
      
      if (response.ok) {
        alert('Applied successfully! Check your dashboard.');
        fetchPractices();
      } else {
        alert('Failed to apply');
      }
    } catch (err) {
      console.error(err);
      alert('Error applying practice');
    } finally {
      setApplyingPracticeId(null);
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
        lang={language}
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
        lang={language}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{t.traditionalKnowledge}</h1>
            <button
              onClick={() => setLanguage(language === 'en' ? 'te' : 'en')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              title={language === 'en' ? 'Switch to Telugu' : 'Switch to English'}
            >
              <Languages size={20} />
              <span className="font-semibold">{language === 'en' ? 'తెలుగు' : 'English'}</span>
            </button>
          </div>
          <p className="text-gray-600 mt-1">{t.ancientFarmingWisdom}</p>
        </div>
        {isSpecialist && (
          <div className="flex gap-3">
            <button 
              onClick={handleSeedData}
              disabled={seeding}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm disabled:bg-gray-400"
            >
              <Plus size={20} />
              {seeding ? t.seeding : t.seedSampleData}
            </button>
            <button 
              onClick={() => setShowCreateForm(true)} 
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 shadow-sm"
            >
              <Plus size={20} />{t.addPractice}
            </button>
          </div>
        )}
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
        <p className="text-purple-900 font-semibold mb-2">
          {t.wisdomTitle}
        </p>
        <p className="text-purple-800 text-sm">
          {t.wisdomDescription}
        </p>
      </div>

      <div className="bg-white rounded-lg border p-4 space-y-4 shadow-sm">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t.searchPractices}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button onClick={handleSearch} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            {t.search}
          </button>
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <Filter size={20} />{t.filters}
          </button>
        </div>

        {showFilters && (
          <div className="pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4">
            <select 
              value={filters.category} 
              onChange={(e) => setFilters({...filters, category: e.target.value})} 
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">{t.allCategories}</option>
              <option value="planting">{t.planting}</option>
              <option value="pest_control">{t.pestControl}</option>
              <option value="soil_management">{t.soilManagement}</option>
              <option value="water_conservation">{t.waterConservation}</option>
              <option value="seed_treatment">{t.seedTreatment}</option>
            </select>
            <select 
              value={filters.season} 
              onChange={(e) => setFilters({...filters, season: e.target.value})} 
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">{t.allSeasons}</option>
              <option value="all_seasons">{t.allSeasons}</option>
              <option value="kharif">{t.kharif}</option>
              <option value="rabi">{t.rabi}</option>
              <option value="summer">{t.summer}</option>
            </select>
            <select 
              value={filters.difficulty} 
              onChange={(e) => setFilters({...filters, difficulty: e.target.value})} 
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">{t.allDifficulties}</option>
              <option value="easy">{t.easy}</option>
              <option value="medium">{t.medium}</option>
              <option value="hard">{t.hard}</option>
            </select>
            <input 
              type="text" 
              placeholder={t.region}
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
                {t.showOnlyVerified}
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
          <p className="text-gray-600">{t.noPracticesFound}</p>
          {isSpecialist && (
            <button 
              onClick={handleSeedData}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              {t.seedSampleData}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {practices.map((p) => (
            <div 
              key={p.id} 
              className="bg-white border rounded-lg overflow-hidden hover:border-purple-500 transition-all hover:shadow-lg"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 
                    className="text-lg font-semibold flex-1 cursor-pointer hover:text-purple-600"
                    onClick={() => setSelectedPractice(p.id)}
                  >
                    {p.title}
                  </h3>
                  {p.verified_by_elders && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      <Award size={12} />
                      {t.verified}
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

                <div className="flex flex-wrap gap-2 mb-4">
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
                  <div className="pb-4 border-b mb-4">
                    <p className="text-xs text-gray-500 mb-1">{t.bestFor}:</p>
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

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedPractice(p.id)}
                    className="flex-1 px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 text-sm font-medium transition-colors"
                  >
                    {t.viewDetails}
                  </button>
                  {isFarmer && (
                    <button
                      onClick={(e) => handleQuickApply(e, p.id)}
                      disabled={applyingPracticeId === p.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors flex items-center gap-1 disabled:bg-gray-400"
                      title={t.applyThisPractice}
                    >
                      <CheckCircle size={16} />
                      {applyingPracticeId === p.id ? '...' : t.apply}
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
}import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, X, ChevronRight, AlertCircle, Edit, Trash2, 
  MapPin, Users, Calendar, Star, TrendingUp, Award, Leaf, BookOpen,
  CheckCircle, Clock, Target, Languages
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:8000/api';

// Translation object
const translations = {
  en: {
    traditionalKnowledge: 'Traditional Knowledge',
    ancientFarmingWisdom: 'Ancient farming wisdom from tribal communities',
    seedSampleData: 'Seed Sample Data',
    addPractice: 'Add Practice',
    wisdomDescription: 'These practices have been used by tribal communities for centuries and are proven to work in harmony with nature.',
    wisdomTitle: 'Ancient farming wisdom passed down through generations',
    searchPractices: 'Search practices...',
    search: 'Search',
    filters: 'Filters',
    allCategories: 'All Categories',
    planting: 'Planting',
    pestControl: 'Pest Control',
    soilManagement: 'Soil Management',
    waterConservation: 'Water Conservation',
    seedTreatment: 'Seed Treatment',
    allSeasons: 'All Seasons',
    kharif: 'Kharif',
    rabi: 'Rabi',
    summer: 'Summer',
    allDifficulties: 'All Difficulties',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    region: 'Region',
    verified: 'Verified',
    showOnlyVerified: 'Show only Elder Verified practices',
    noPracticesFound: 'No practices found',
    viewDetails: 'View Details',
    apply: 'Apply',
    backToPractices: 'Back to Practices',
    applyThisPractice: 'Apply This Practice',
    edit: 'Edit',
    delete: 'Delete',
    rating: 'Rating',
    successRate: 'Success Rate',
    applications: 'Applications',
    difficulty: 'Difficulty',
    category: 'Category',
    season: 'Season',
    tribe: 'Tribe',
    duration: 'Duration',
    suitableForCrops: 'Suitable For Crops',
    implementsNeeded: 'Implements Needed',
    scientificBasis: 'Scientific Basis',
    elderVerification: 'Elder Verification',
    verifiedBy: 'Verified by',
    contact: 'Contact',
    localNames: 'Local Names',
    imagesMedia: 'Images & Media',
    videoResources: 'Video Resources',
    successStories: 'Success Stories',
    bestFor: 'Best for',
    applyPractice: 'Apply Practice',
    recordApplication: 'Record your application of',
    location: 'Location',
    optional: 'optional',
    notes: 'Notes',
    enterLocation: 'Enter location',
    anyObservations: 'Any observations or notes about this application...',
    cancel: 'Cancel',
    applying: 'Applying...',
    practiceTitle: 'Practice Title',
    description: 'Description',
    tribeName: 'Tribe Name',
    localLanguage: 'Local Language',
    suitableCrops: 'Suitable Crops',
    addCrop: 'Add crop and press Enter',
    add: 'Add',
    addImplement: 'Add implement and press Enter',
    localNamesByLanguage: 'Local Names (by Language)',
    language: 'Language',
    localName: 'Local name',
    mediaUrls: 'Media URLs (Images)',
    videoUrls: 'Video URLs (YouTube, etc.)',
    verifiedByElders: 'Verified by Tribal Elders',
    elderName: 'Elder Name',
    elderContact: 'Elder Contact',
    createPractice: 'Create Practice',
    updatePractice: 'Update Practice',
    creating: 'Creating...',
    updating: 'Updating...',
    back: 'Back',
    addTraditionalPractice: 'Add Traditional Practice',
    editTraditionalPractice: 'Edit Traditional Practice',
    seeding: 'Seeding...',
    deleting: 'Deleting...',
    viewFullSize: 'View Full Size',
    video: 'Video'
  },
  te: {
    traditionalKnowledge: 'సాంప్రదాయ జ్ఞానం',
    ancientFarmingWisdom: 'గిరిజన సమాజాల నుండి పురాతన వ్యవసాయ జ్ఞానం',
    seedSampleData: 'నమూనా డేటా జోడించండి',
    addPractice: 'పద్ధతిని జోడించండి',
    wisdomDescription: 'ఈ పద్ధతులు శతాబ్దాలుగా గిరిజన సమాజాలచే ఉపయోగించబడుతున్నాయి మరియు ప్రకృతితో సామరస్యంగా పని చేస్తాయి.',
    wisdomTitle: 'తరతరాలుగా అందజేయబడిన పురాతన వ్యవసాయ జ్ఞానం',
    searchPractices: 'పద్ధతులను శోధించండి...',
    search: 'శోధన',
    filters: 'ఫిల్టర్లు',
    allCategories: 'అన్ని వర్గాలు',
    planting: 'నాటడం',
    pestControl: 'తెగులు నియంత్రణ',
    soilManagement: 'నేల నిర్వహణ',
    waterConservation: 'నీటి సంరక్షణ',
    seedTreatment: 'విత్తన చికిత్స',
    allSeasons: 'అన్ని కాలాలు',
    kharif: 'ఖరీఫ్',
    rabi: 'రబీ',
    summer: 'వేసవి',
    allDifficulties: 'అన్ని కష్టాల స్థాయిలు',
    easy: 'సులభం',
    medium: 'మధ్యస్థ',
    hard: 'కష్టం',
    region: 'ప్రాంతం',
    verified: 'ధృవీకరించబడింది',
    showOnlyVerified: 'పెద్దల ధృవీకరించిన పద్ధతులను మాత్రమే చూపించు',
    noPracticesFound: 'పద్ధతులు కనుగొనబడలేదు',
    viewDetails: 'వివరాలు చూడండి',
    apply: 'అమలు చేయండి',
    backToPractices: 'పద్ధతులకు తిరిగి',
    applyThisPractice: 'ఈ పద్ధతిని అమలు చేయండి',
    edit: 'సవరించు',
    delete: 'తొలగించు',
    rating: 'రేటింగ్',
    successRate: 'విజయ రేటు',
    applications: 'అప్లికేషన్లు',
    difficulty: 'కష్టం',
    category: 'వర్గం',
    season: 'కాలం',
    tribe: 'తెగ',
    duration: 'వ్యవధి',
    suitableForCrops: 'పంటలకు అనువుగా',
    implementsNeeded: 'అవసరమైన పరికరాలు',
    scientificBasis: 'శాస్త్రీయ ఆధారం',
    elderVerification: 'పెద్దల ధృవీకరణ',
    verifiedBy: 'ధృవీకరించినవారు',
    contact: 'సంప్రదించండి',
    localNames: 'స్థానిక పేర్లు',
    imagesMedia: 'చిత్రాలు & మీడియా',
    videoResources: 'వీడియో వనరులు',
    successStories: 'విజయ కథలు',
    bestFor: 'దీనికి ఉత్తమం',
    applyPractice: 'పద్ధతిని అమలు చేయండి',
    recordApplication: 'మీ అప్లికేషన్ను రికార్డ్ చేయండి',
    location: 'స్థలం',
    optional: 'ఐచ్ఛికం',
    notes: 'గమనికలు',
    enterLocation: 'స్థలాన్ని నమోదు చేయండి',
    anyObservations: 'ఈ అప్లికేషన్ గురించి ఏవైనా పరిశీలనలు లేదా గమనికలు...',
    cancel: 'రద్దు చేయి',
    applying: 'అమలు చేస్తోంది...',
    practiceTitle: 'పద్ధతి శీర్షిక',
    description: 'వివరణ',
    tribeName: 'తెగ పేరు',
    localLanguage: 'స్థానిక భాష',
    suitableCrops: 'అనువైన పంటలు',
    addCrop: 'పంటను జోడించి ఎంటర్ నొక్కండి',
    add: 'జోడించు',
    addImplement: 'పరికరాన్ని జోడించి ఎంటర్ నొక్కండి',
    localNamesByLanguage: 'స్థానిక పేర్లు (భాష వారీగా)',
    language: 'భాష',
    localName: 'స్థానిక పేరు',
    mediaUrls: 'మీడియా URLs (చిత్రాలు)',
    videoUrls: 'వీడియో URLs (YouTube, మొదలైనవి)',
    verifiedByElders: 'గిరిజన పెద్దలచే ధృవీకరించబడింది',
    elderName: 'పెద్ద పేరు',
    elderContact: 'పెద్ద సంప్రదింపు',
    createPractice: 'పద్ధతిని సృష్టించు',
    updatePractice: 'పద్ధతిని నవీకరించు',
    creating: 'సృష్టిస్తోంది...',
    updating: 'నవీకరిస్తోంది...',
    back: 'వెనుకకు',
    addTraditionalPractice: 'సాంప్రదాయ పద్ధతిని జోడించండి',
    editTraditionalPractice: 'సాంప్రదాయ పద్ధతిని సవరించండి',
    seeding: 'విత్తనం చేస్తోంది...',
    deleting: 'తొలగిస్తోంది...',
    viewFullSize: 'పూర్తి పరిమాణంలో చూడండి',
    video: 'వీడియో'
  }
};

// Apply Practice Modal Component
function ApplyPracticeModal({ practiceId, practiceName, onClose, onSuccess, lang = 'en' }) {
  const [applying, setApplying] = useState(false);
  const [formData, setFormData] = useState({
    crop_id: '',
    location: '',
    notes: '',
    before_photo_url: ''
  });
  const { getToken, user } = useAuth();
  const t = translations[lang];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setApplying(true);
      const token = getToken();
      const response = await fetch(`${API_URL}/traditional-practices/${practiceId}/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          location: formData.location || user?.village || user?.district
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to apply practice');
      }

      alert('✅ Practice applied successfully! Check your dashboard for updated metrics.');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Apply error:', error);
      alert('❌ Failed to apply practice: ' + error.message);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{t.applyPractice}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <p className="text-gray-600 mb-4">
          {t.recordApplication} <strong>{practiceName}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.location} ({t.optional})
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder={user?.village || user?.district || t.enterLocation}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.notes} ({t.optional})
            </label>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder={t.anyObservations}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={applying}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              <CheckCircle size={20} />
              {applying ? t.applying : t.applyPractice}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Create Practice Form
function CreatePracticeForm({ onBack, editMode = false, existingPractice = null, lang = 'en' }) {
  const t = translations[lang];
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
        <ChevronRight size={20} className="rotate-180" />{t.back}
      </button>
      <h1 className="text-3xl font-bold mb-6">
        {editMode ? t.editTraditionalPractice : t.addTraditionalPractice}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.practiceTitle} *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.description} *</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.category} *</label>
              <select 
                required 
                value={formData.category} 
                onChange={(e) => setFormData({...formData, category: e.target.value})} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="planting">{t.planting}</option>
                <option value="pest_control">{t.pestControl}</option>
                <option value="soil_management">{t.soilManagement}</option>
                <option value="water_conservation">{t.waterConservation}</option>
                <option value="seed_treatment">{t.seedTreatment}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.season} *</label>
              <select 
                required 
                value={formData.season} 
                onChange={(e) => setFormData({...formData, season: e.target.value})} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all_seasons">{t.allSeasons}</option>
                <option value="kharif">{t.kharif}</option>
                <option value="rabi">{t.rabi}</option>
                <option value="summer">{t.summer}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.region} *</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.tribeName}</label>
              <input 
                type="text" 
                value={formData.tribe_name} 
                onChange={(e) => setFormData({...formData, tribe_name: e.target.value})} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" 
                placeholder="e.g., Koya Tribe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.localLanguage}</label>
              <input 
                type="text" 
                value={formData.local_language} 
                onChange={(e) => setFormData({...formData, local_language: e.target.value})} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" 
                placeholder="e.g., Telugu, Koya"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.difficulty} *</label>
              <select 
                required 
                value={formData.difficulty_level} 
                onChange={(e) => setFormData({...formData, difficulty_level: e.target.value})} 
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="easy">{t.easy}</option>
                <option value="medium">{t.medium}</option>
                <option value="hard">{t.hard}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.duration}</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.suitableCrops}</label>
            <div className="flex gap-2 mb-2">
              <input 
                type="text" 
                value={cropInput} 
                onChange={(e) => setCropInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCrop())}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" 
                placeholder={t.addCrop}
              />
              <button type="button" onClick={addCrop} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                {t.add}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.implementsNeeded}</label>
            <div className="flex gap-2 mb-2">
              <input 
                type="text" 
                value={implementInput} 
                onChange={(e) => setImplementInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImplement())}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" 
                placeholder={t.addImplement}
              />
              <button type="button" onClick={addImplement} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                {t.add}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.scientificBasis}</label>
            <textarea 
              rows="3" 
              value={formData.scientific_basis} 
              onChange={(e) => setFormData({...formData, scientific_basis: e.target.value})} 
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" 
              placeholder="Modern scientific explanation of why this practice works"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.localNamesByLanguage}</label>
            <div className="flex gap-2 mb-2">
              <input 
                type="text" 
                value={localNameLang} 
                onChange={(e) => setLocalNameLang(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" 
                placeholder={t.language + " (e.g., telugu, hindi)"}
              />
              <input 
                type="text" 
                value={localNameText} 
                onChange={(e) => setLocalNameText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLocalName())}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" 
                placeholder={t.localName}
              />
              <button type="button" onClick={addLocalName} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                {t.add}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.mediaUrls}</label>
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
                {t.add}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.videoUrls}</label>
            <div className="flex gap-2 mb-2">
              <input 
                type="url" 
                value={videoUrlInput} 
                onChange={(e) => setVideoUrlInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVideoUrl())}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" 
                placeholder="https://youtube.com/watch?v=..."
              />
              <button type="button" onClick={addVideoUrl} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                {t.add}
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
                {t.verifiedByElders}
              </label>
            </div>

            {formData.verified_by_elders && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.elderName}</label>
                  <input 
                    type="text" 
                    value={formData.elder_name} 
                    onChange={(e) => setFormData({...formData, elder_name: e.target.value})} 
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.elderContact}</label>
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
            {t.cancel}
          </button>
          <button 
            type="submit" 
            disabled={submitting} 
            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
          >
            {submitting ? (editMode ? t.updating : t.creating) : (editMode ? t.updatePractice : t.createPractice)}
          </button>
        </div>
      </form>
    </div>
  );
}

// Practice Detail View
function PracticeDetailView({ practiceId, onBack, onEdit, onDelete, lang = 'en' }) {
  const [practice, setPractice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const { getToken, user } = useAuth();
  const isSpecialist = user?.role === 'specialist';
  const isFarmer = user?.role === 'farmer';
  const t = translations[lang];

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

  const handleApplySuccess = () => {
    fetchDetails();
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
      {showApplyModal && (
        <ApplyPracticeModal
          practiceId={practiceId}
          practiceName={practice.title}
          onClose={() => setShowApplyModal(false)}
          onSuccess={handleApplySuccess}
          lang={lang}
        />
      )}

      <div className="flex justify-between items-center">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ChevronRight size={20} className="rotate-180" />{t.backToPractices}
        </button>
        
        <div className="flex gap-3">
          {isFarmer && (
            <button 
              onClick={() => setShowApplyModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-lg font-semibold"
            >
              <CheckCircle size={20} />
              {t.applyThisPractice}
            </button>
          )}
          {isSpecialist && (
            <>
              <button 
                onClick={() => onEdit(practice)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit size={20} />{t.edit}
              </button>
              <button 
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
              >
                <Trash2 size={20} />
                {deleting ? t.deleting : t.delete}
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
              {t.verified}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Star size={24} className="mx-auto text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-purple-600">{practice.average_rating || 0}</p>
            <p className="text-sm text-gray-600">{t.rating}</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <TrendingUp size={24} className="mx-auto text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-blue-600">{practice.success_rate || 0}%</p>
            <p className="text-sm text-gray-600">{t.successRate}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Users size={24} className="mx-auto text-green-600 mb-2" />
            <p className="text-2xl font-bold text-green-600">{practice.applications_count || 0}</p>
            <p className="text-sm text-gray-600">{t.applications}</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Target size={24} className="mx-auto text-orange-600 mb-2" />
            <p className="text-2xl font-bold text-orange-600 capitalize">{practice.difficulty_level}</p>
            <p className="text-sm text-gray-600">{t.difficulty}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t pt-4">
          <div>
            <p className="text-sm text-gray-500 mb-1">{t.category}</p>
            <p className="font-medium capitalize">{practice.category.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">{t.season}</p>
            <p className="font-medium capitalize">{practice.season.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">{t.region}</p>
            <p className="font-medium flex items-center gap-1">
              <MapPin size={16} className="text-gray-400" />
              {practice.region}
            </p>
          </div>
          {practice.tribe_name && (
            <div>
              <p className="text-sm text-gray-500 mb-1">{t.tribe}</p>
              <p className="font-medium">{practice.tribe_name}</p>
            </div>
          )}
          {practice.duration && (
            <div>
              <p className="text-sm text-gray-500 mb-1">{t.duration}</p>
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
            {t.suitableForCrops}
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
          <h3 className="text-xl font-semibold mb-4">{t.implementsNeeded}</h3>
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
            {t.scientificBasis}
          </h3>
          <p className="text-gray-700">{practice.scientific_basis}</p>
        </div>
      )}

      {practice.verified_by_elders && practice.elder_name && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 text-green-800">
            <Award className="text-green-600" />
            {t.elderVerification}
          </h3>
          <p className="text-green-700">{t.verifiedBy}: <span className="font-medium">{practice.elder_name}</span></p>
          {practice.elder_contact && (
            <p className="text-green-600 text-sm mt-1">{t.contact}: {practice.elder_contact}</p>
          )}
        </div>
      )}

      {practice.local_names && Object.keys(practice.local_names).length > 0 && (
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">{t.localNames}</h3>
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
          <h3 className="text-xl font-semibold mb-4">{t.imagesMedia}</h3>
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
                  <span className="text-white font-semibold">{t.viewFullSize}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {practice.video_urls && practice.video_urls.length > 0 && (
        <div className="bg-white rounded-lg border p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-4">{t.videoResources}</h3>
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
                  <p className="text-sm font-medium text-gray-900 truncate">{t.video} {idx + 1}</p>
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
          <h3 className="text-xl font-semibold mb-4">{t.successStories}</h3>
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