import { useState, useEffect } from 'react';
import { Calendar, Cloud, Droplets, Sun, Wind, AlertTriangle, TrendingUp, Leaf, Sprout, X, Info, Beaker, Bug, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SeasonalCalendarPage() {
  const [currentSeason, setCurrentSeason] = useState(null);
  const [calendarData, setCalendarData] = useState([]);
  const [cropRecommendations, setCropRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedCrop, setSelectedCrop] = useState(null); // For modal
  const { getToken } = useAuth();

  const API_BASE = 'http://localhost:8000';
  const token = getToken();

  useEffect(() => {
    fetchAllSeasonalData();
  }, []);

  const fetchAllSeasonalData = async () => {
    try {
      const seasonResponse = await fetch(`${API_BASE}/api/seasonal-calendar/current`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const seasonData = await seasonResponse.json();
      setCurrentSeason(seasonData);

      const calendarResponse = await fetch(`${API_BASE}/api/seasonal-calendar`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const calData = await calendarResponse.json();
      setCalendarData(calData.calendar);

      const cropsResponse = await fetch(`${API_BASE}/api/seasonal-calendar/crop-recommendations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const cropsData = await cropsResponse.json();
      setCropRecommendations(cropsData.recommendations || []);
      
    } catch (error) {
      console.error('Error fetching seasonal data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Crop growing guides data
  const getCropGuide = (cropName) => {
    const guides = {
      "Rice": {
        sowing_time: "June-July (Kharif), November-December (Rabi)",
        land_preparation: "Plough the field 2-3 times, level properly, ensure proper drainage channels",
        seed_rate: "20-25 kg/acre for transplanting, 40-50 kg/acre for direct seeding",
        spacing: "20cm x 15cm for transplanting",
        irrigation: "Keep 2-3 inches water standing in field during vegetative stage. Drain 10-15 days before harvest",
        fertilizer: "Apply FYM @ 8-10 tons/acre. Vermicompost @ 2 tons/acre. Green manure before sowing",
        pest_management: "Use neem oil spray, install light traps for stem borers. Apply Trichoderma for blast disease",
        harvesting: "120-150 days after transplanting when 80% grains turn golden yellow",
        yield: "25-30 quintals/acre"
      },
      "Cotton": {
        sowing_time: "May-June",
        land_preparation: "Deep ploughing in summer, 2-3 harrowing, apply FYM before sowing",
        seed_rate: "3-4 kg/acre",
        spacing: "90cm x 60cm (row to row x plant to plant)",
        irrigation: "Critical stages: flowering and boll development. Avoid waterlogging",
        fertilizer: "Vermicompost @ 2 tons/acre, Neem cake @ 200 kg/acre. Foliar spray of Panchagavya",
        pest_management: "Yellow sticky traps for whitefly, neem oil for aphids, hand-pick pink bollworms. Spray Bt at flowering",
        harvesting: "150-180 days, pick bolls when fully opened in 3-4 pickings",
        yield: "15-20 quintals/acre"
      },
      "Wheat": {
        sowing_time: "November-December",
        land_preparation: "Fine tilth required. Level the field properly. Apply FYM @ 10 tons/acre",
        seed_rate: "40-50 kg/acre",
        spacing: "20-22 cm line spacing",
        irrigation: "Crown root initiation (20-25 DAS), tillering (40-45 DAS), flowering (60-65 DAS), grain filling (85-90 DAS)",
        fertilizer: "Vermicompost @ 2.5 tons/acre. Apply enriched FYM. Jeevamrutham spray every 15 days",
        pest_management: "Seed treatment with neem powder. Monitor for aphids. Use neem oil spray if needed",
        harvesting: "120-140 days when grains are hard and straw turns golden yellow",
        yield: "20-25 quintals/acre"
      },
      "Soybean": {
        sowing_time: "June-July with onset of monsoon",
        land_preparation: "1-2 deep ploughing followed by planking",
        seed_rate: "30-35 kg/acre",
        spacing: "45cm x 10cm",
        irrigation: "Rainfed crop. Supplemental irrigation at flowering and pod filling if needed",
        fertilizer: "Rhizobium culture for seed treatment. Apply Vermicompost @ 2 tons/acre",
        pest_management: "Monitor for stem fly, girdle beetle. Use neem oil and install pheromone traps",
        harvesting: "90-100 days when leaves turn yellow and pods rattle",
        yield: "8-12 quintals/acre"
      },
      "Chickpea": {
        sowing_time: "October-November",
        land_preparation: "Fine tilth, good drainage essential. Apply FYM @ 5-6 tons/acre",
        seed_rate: "20-25 kg/acre",
        spacing: "30cm x 10cm",
        irrigation: "1-2 irrigations: pre-flowering and pod filling stage",
        fertilizer: "Rhizobium seed treatment mandatory. Vermicompost @ 1.5 tons/acre",
        pest_management: "Monitor for pod borer. Use neem oil spray. Hand-pick infected pods",
        harvesting: "120-140 days when plants dry and pods turn brown",
        yield: "8-10 quintals/acre"
      },
      "Watermelon": {
        sowing_time: "January-March (Summer crop)",
        land_preparation: "Raised beds or ridges for good drainage. Apply FYM @ 8-10 tons/acre",
        seed_rate: "1-1.5 kg/acre",
        spacing: "2m x 2m (for large varieties)",
        irrigation: "Drip irrigation recommended. Reduce water near harvest for sweetness",
        fertilizer: "Vermicompost @ 2 tons/acre. Foliar spray of seaweed extract",
        pest_management: "Mulching to prevent fruit rot. Neem oil for aphids and fruit flies",
        harvesting: "80-90 days. Check for hollow sound when tapped",
        yield: "150-200 quintals/acre"
      }
    };

    return guides[cropName] || {
      sowing_time: "Information not available",
      land_preparation: "Prepare field with proper ploughing and leveling",
      seed_rate: "Consult local agricultural expert",
      spacing: "Follow standard spacing for the crop",
      irrigation: "Provide adequate water as per crop requirement",
      fertilizer: "Use organic fertilizers like FYM and vermicompost",
      pest_management: "Monitor regularly and use organic pesticides",
      harvesting: "Harvest at proper maturity stage",
      yield: "Varies based on practices"
    };
  };

  const getSeasonIcon = (season) => {
    switch (season?.toLowerCase()) {
      case 'kharif': return <Cloud className="w-6 h-6 text-blue-600" />;
      case 'rabi': return <Sun className="w-6 h-6 text-yellow-600" />;
      case 'summer/zaid':
      case 'summer': return <Sun className="w-6 h-6 text-orange-600" />;
      default: return <Calendar className="w-6 h-6 text-gray-600" />;
    }
  };

  const getSeasonColor = (season) => {
    switch (season?.toLowerCase()) {
      case 'kharif': return 'bg-blue-50 border-blue-200';
      case 'rabi': return 'bg-green-50 border-green-200';
      case 'summer/zaid':
      case 'summer': return 'bg-orange-50 border-orange-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getSeasonTextColor = (season) => {
    switch (season?.toLowerCase()) {
      case 'kharif': return 'text-blue-900';
      case 'rabi': return 'text-green-900';
      case 'summer/zaid':
      case 'summer': return 'text-orange-900';
      default: return 'text-gray-900';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRiskIcon = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return '✓';
      default: return '•';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading seasonal calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Calendar className="w-8 h-8 text-green-600" />
          Seasonal Calendar
        </h1>
      </div>

      {/* Current Season Card */}
      {currentSeason && (
        <div className={`rounded-xl border-2 p-6 ${getSeasonColor(currentSeason.season)}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {getSeasonIcon(currentSeason.season)}
                <h2 className={`text-2xl font-bold ${getSeasonTextColor(currentSeason.season)}`}>
                  Current Season: {currentSeason.season}
                </h2>
              </div>
              <p className={`text-sm mb-4 ${getSeasonTextColor(currentSeason.season)}`}>
                {currentSeason.description}
              </p>
              <div className="mb-4">
                <h3 className={`font-semibold mb-2 ${getSeasonTextColor(currentSeason.season)}`}>
                  Recommended Crops for {currentSeason.current_month}:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentSeason.recommended_crops?.map((crop, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white rounded-full text-sm font-medium shadow-sm">
                      🌾 {crop}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {currentSeason.weather_alerts?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-current border-opacity-20">
              <h3 className={`font-semibold mb-3 flex items-center gap-2 ${getSeasonTextColor(currentSeason.season)}`}>
                <AlertTriangle className="w-5 h-5" />
                Recent Weather Alerts
              </h3>
              <div className="space-y-2">
                {currentSeason.weather_alerts.slice(0, 3).map((alert, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-start gap-2">
                      <Wind className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                        {alert.action && <p className="text-xs text-gray-600 mt-1">Action: {alert.action}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'calendar' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Monthly Calendar
            </button>
            <button
              onClick={() => setActiveTab('crops')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'crops' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Sprout className="w-4 h-4 inline mr-2" />
              Crop Recommendations
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'calendar' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {calendarData.map((month, idx) => (
                <div
                  key={idx}
                  className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer hover:border-green-300"
                  onClick={() => setSelectedMonth(selectedMonth === idx ? null : idx)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900">{month.month}</h3>
                    {month.temperature && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        month.temperature?.includes('Hot') ? 'bg-red-100 text-red-800' :
                        month.temperature?.includes('Cool') || month.temperature?.includes('Cold') ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {month.temperature}
                      </span>
                    )}
                  </div>

                  {month.season && (
                    <div className="mb-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        <Calendar className="w-3 h-3" />
                        {month.season}
                      </span>
                    </div>
                  )}

                  {month.activities && (
                    <div className="mb-3">
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">Key Activities:</h4>
                      <ul className="space-y-1">
                        {month.activities.slice(0, 2).map((activity, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">•</span>
                            <span className="flex-1">{activity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedMonth === idx && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                      {month.preventive_actions && month.preventive_actions.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-green-700 mb-2 flex items-center gap-1">
                            <Droplets className="w-3 h-3" />
                            Preventive Actions:
                          </h4>
                          <ul className="space-y-1">
                            {month.preventive_actions.map((action, i) => (
                              <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                                <span className="text-green-500">✓</span>
                                <span className="flex-1">{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {month.recommended_crops && month.recommended_crops.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-blue-700 mb-2">Recommended Crops:</h4>
                          <div className="flex flex-wrap gap-1">
                            {month.recommended_crops.map((crop, i) => (
                              <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                                {crop}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {month.activities && month.activities.length > 2 && (
                        <div>
                          <h4 className="text-xs font-semibold text-gray-700 mb-2">All Activities:</h4>
                          <ul className="space-y-1">
                            {month.activities.slice(2).map((activity, i) => (
                              <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                                <span className="text-green-600">•</span>
                                <span className="flex-1">{activity}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    className="mt-3 text-xs text-green-600 hover:text-green-700 font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMonth(selectedMonth === idx ? null : idx);
                    }}
                  >
                    {selectedMonth === idx ? 'Show less' : 'Show more'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'crops' && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Sprout className="w-6 h-6 text-green-600" />
                  Crops Recommended for {currentSeason?.season} Season
                </h3>
                <p className="text-sm text-gray-600">
                  Based on current season, climate conditions, and historical disease data
                </p>
              </div>

              {cropRecommendations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cropRecommendations.map((crop, idx) => (
                    <div key={idx} className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all hover:border-green-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-900 mb-1">{crop.name}</h4>
                          {crop.local_name && <p className="text-sm text-gray-500 font-medium">({crop.local_name})</p>}
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${getRiskColor(crop.disease_risk)}`}>
                          {getRiskIcon(crop.disease_risk)} {crop.disease_risk}
                        </span>
                      </div>

                      {crop.soil_types && crop.soil_types.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                            <Leaf className="w-3 h-3" />
                            Suitable Soil Types:
                          </h5>
                          <div className="flex flex-wrap gap-1">
                            {crop.soil_types.map((soil, i) => (
                              <span key={i} className="px-2 py-1 bg-amber-50 text-amber-800 text-xs rounded-md font-medium border border-amber-200">
                                {soil}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-600 mb-2">
                          {crop.disease_risk === 'High' && 'Requires careful monitoring and preventive measures'}
                          {crop.disease_risk === 'Medium' && 'Regular monitoring recommended'}
                          {crop.disease_risk === 'Low' && 'Generally disease-resistant with proper care'}
                        </p>
                        <button 
                          onClick={() => setSelectedCrop(crop)}
                          className="text-sm text-green-600 hover:text-green-700 font-medium hover:underline"
                        >
                          View Growing Guide →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <Leaf className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No crop recommendations available for this season</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Best Practices Section */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Seasonal Best Practices
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">Crop Rotation</h4>
            <p className="text-sm text-gray-600">Practice 3-4 crop rotation to maintain soil health and reduce pest buildup</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Water Management</h4>
            <p className="text-sm text-gray-600">Adopt drip irrigation and mulching to conserve water during dry seasons</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-purple-800 mb-2">Organic Matter</h4>
            <p className="text-sm text-gray-600">Add compost and green manure regularly to improve soil fertility</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-semibold text-orange-800 mb-2">Pest Monitoring</h4>
            <p className="text-sm text-gray-600">Install pheromone traps and practice integrated pest management</p>
          </div>
        </div>
      </div>

      {/* Growing Guide Modal */}
      {selectedCrop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedCrop(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedCrop.name} Growing Guide</h2>
                  {selectedCrop.local_name && <p className="text-green-100">({selectedCrop.local_name})</p>}
                </div>
                <button onClick={() => setSelectedCrop(null)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {(() => {
                const guide = getCropGuide(selectedCrop.name);
                return (
                  <>
                    {/* Overview */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-blue-900">Quick Overview</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                          <p className="text-xs text-gray-600">Sowing Time</p>
                          <p className="text-sm font-medium text-gray-900">{guide.sowing_time}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Expected Yield</p>
                          <p className="text-sm font-medium text-gray-900">{guide.yield}</p>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Sections */}
                    <div className="space-y-4">
                      {/* Land Preparation */}
                      <div className="border-2 border-gray-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Leaf className="w-5 h-5 text-green-600" />
                          <h3 className="font-bold text-gray-900">Land Preparation</h3>
                        </div>
                        <p className="text-sm text-gray-700">{guide.land_preparation}</p>
                      </div>

                      {/* Seed & Spacing */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="border-2 border-gray-200 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Sprout className="w-5 h-5 text-purple-600" />
                            <h3 className="font-bold text-gray-900">Seed Rate</h3>
                          </div>
                          <p className="text-sm text-gray-700">{guide.seed_rate}</p>
                        </div>
                        <div className="border-2 border-gray-200 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Calendar className="w-5 h-5 text-orange-600" />
                            <h3 className="font-bold text-gray-900">Spacing</h3>
                          </div>
                          <p className="text-sm text-gray-700">{guide.spacing}</p>
                        </div>
                      </div>

                      {/* Irrigation */}
                      <div className="border-2 border-gray-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Droplets className="w-5 h-5 text-blue-600" />
                          <h3 className="font-bold text-gray-900">Irrigation Management</h3>
                        </div>
                        <p className="text-sm text-gray-700">{guide.irrigation}</p>
                      </div>

                      {/* Fertilizer */}
                      <div className="border-2 border-gray-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Beaker className="w-5 h-5 text-green-600" />
                          <h3 className="font-bold text-gray-900">Organic Fertilization</h3>
                        </div>
                        <p className="text-sm text-gray-700">{guide.fertilizer}</p>
                      </div>

                      {/* Pest Management */}
                      {/* Pest Management */}
                      <div className="border-2 border-red-200 bg-red-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Shield className="w-5 h-5 text-red-600" />
                          <h3 className="font-bold text-gray-900">Pest & Disease Management</h3>
                        </div>
                        <p className="text-sm text-gray-700">{guide.pest_management}</p>
                      </div>

                      {/* Harvesting */}
                      <div className="border-2 border-gray-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="w-5 h-5 text-amber-600" />
                          <h3 className="font-bold text-gray-900">Harvesting</h3>
                        </div>
                        <p className="text-sm text-gray-700">{guide.harvesting}</p>
                      </div>
                    </div>

                    {/* Additional Info */}
                    {selectedCrop.soil_types && selectedCrop.soil_types.length > 0 && (
                      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                        <h4 className="font-semibold text-amber-900 mb-2">Suitable Soil Types</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedCrop.soil_types.map((soil, i) => (
                            <span key={i} className="px-3 py-1 bg-white text-amber-800 text-sm rounded-full border border-amber-300">
                              {soil}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Disease Risk Warning */}
                    <div className={`border-l-4 p-4 rounded-r-lg ${
                      selectedCrop.disease_risk === 'High' ? 'bg-red-50 border-red-500' :
                      selectedCrop.disease_risk === 'Medium' ? 'bg-yellow-50 border-yellow-500' :
                      'bg-green-50 border-green-500'
                    }`}>
                      <h4 className={`font-semibold mb-2 ${
                        selectedCrop.disease_risk === 'High' ? 'text-red-900' :
                        selectedCrop.disease_risk === 'Medium' ? 'text-yellow-900' :
                        'text-green-900'
                      }`}>
                        Disease Risk: {selectedCrop.disease_risk}
                      </h4>
                      <p className="text-sm text-gray-700">
                        {selectedCrop.disease_risk === 'High' && 
                          'This crop requires intensive monitoring and preventive measures. Regular inspection and early intervention are crucial.'}
                        {selectedCrop.disease_risk === 'Medium' && 
                          'Moderate disease risk. Regular monitoring and timely application of organic treatments recommended.'}
                        {selectedCrop.disease_risk === 'Low' && 
                          'Low disease risk with proper care. Follow standard organic practices for best results.'}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl border-t">
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedCrop(null)}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  Close
                </button>
                <button className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
                  Share Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}