import React, { useState, useEffect } from 'react';
import { 
  Award, TrendingUp, Leaf, Droplets, Wind, Sprout, 
  Users, Calendar, Target, Share2, CheckCircle, 
  Activity, BarChart3, PieChart, BookOpen, MessageSquare,
  Video, FlaskConical, TreeDeciduous, Wallet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ImpactPage = () => {
  const [impactData, setImpactData] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview'); // overview, environmental, achievements
  const { getToken } = useAuth();

  const API_BASE = 'http://localhost:8000';
  const token = getToken();

  useEffect(() => {
    fetchImpactData();
    fetchTimeline();
  }, []);

  const fetchImpactData = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/impact/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setImpactData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching impact data:', error);
      setLoading(false);
    }
  };

  const fetchTimeline = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/impact/timeline?days=30`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setTimeline(data);
    } catch (error) {
      console.error('Error fetching timeline:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your impact...</p>
        </div>
      </div>
    );
  }

  if (!impactData) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <BarChart3 className="w-16 h-16 mx-auto" />
        </div>
        <p className="text-gray-600">Failed to load impact data. Please try again.</p>
      </div>
    );
  }

  const { stats, monthly_progress, cost_savings, environmental_impact, achievements, user_info } = impactData;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Impact Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Member since {user_info.member_since} • {user_info.location}, {user_info.district}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
              {user_info.role === 'farmer' ? 'Farmer' : 'Specialist'}
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
              {stats.streak_days} day streak
            </span>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
          <Share2 className="w-4 h-4" />
          Share Progress
        </button>
      </div>

      {/* View Tabs */}
      <div className="bg-white rounded-xl shadow-sm p-2 flex gap-2">
        <button
          onClick={() => setActiveView('overview')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
            activeView === 'overview' 
              ? 'bg-green-600 text-white' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveView('environmental')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
            activeView === 'environmental' 
              ? 'bg-green-600 text-white' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Environmental
        </button>
        <button
          onClick={() => setActiveView('achievements')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
            activeView === 'achievements' 
              ? 'bg-green-600 text-white' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Achievements
        </button>
      </div>

      {/* Overview Tab */}
      {activeView === 'overview' && (
        <>
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              icon={Award} 
              label="Success Rate" 
              value={`${stats.success_rate}%`} 
              subtitle={`${stats.successful_treatments}/${stats.treatments_applied} treatments`}
              color="green"
              trend={stats.success_rate >= 70 ? "up" : "stable"}
            />
            <StatCard 
              icon={Wallet} 
              label="Cost Saved" 
              value={`₹${Math.round(stats.cost_saved).toLocaleString()}`} 
              subtitle="this season"
              color="blue"
            />
            <StatCard 
              icon={Leaf} 
              label="Chemical Reduction" 
              value={`${stats.chemical_reduction}%`} 
              subtitle={`${stats.organic_solutions_adopted} organic solutions`}
              color="purple"
            />
            <StatCard 
              icon={FlaskConical} 
              label="Crops Monitored" 
              value={stats.total_crops_monitored} 
              subtitle="disease analyses"
              color="orange"
            />
          </div>

          {/* Success Banner */}
          {stats.cost_saved > 1000 && (
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <Award className="w-6 h-6" />
                    Outstanding Progress!
                  </h3>
                  <p className="text-green-100 mb-4">
                    You've saved ₹{Math.round(stats.cost_saved).toLocaleString()} and reduced chemical usage by {stats.chemical_reduction}% this season!
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4" />
                      <span>{environmental_impact.water_saved_liters}L water saved</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4" />
                      <span>{environmental_impact.carbon_reduced_kg}kg CO₂ reduced</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TreeDeciduous className="w-4 h-4" />
                      <span>{environmental_impact.soil_health_score}% soil health</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sprout className="w-4 h-4" />
                      <span>{stats.traditional_practices_used} traditions used</span>
                    </div>
                  </div>
                </div>
                <button className="bg-white text-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-green-50 whitespace-nowrap ml-4">
                  Share Success
                </button>
              </div>
            </div>
          )}

          {/* Activity Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ActivityCard
              icon={Sprout}
              label="Organic Solutions"
              value={stats.organic_solutions_adopted}
              color="green"
            />
            <ActivityCard
              icon={BookOpen}
              label="Traditional Practices"
              value={stats.traditional_practices_used}
              color="amber"
            />
            <ActivityCard
              icon={Video}
              label="Videos Completed"
              value={stats.videos_completed}
              color="blue"
            />
            <ActivityCard
              icon={MessageSquare}
              label="Community Posts"
              value={stats.community_contributions}
              color="purple"
            />
          </div>

          {/* Monthly Progress */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-600" />
                Monthly Progress
              </h3>
              <span className="text-sm text-gray-500">Last 30 days</span>
            </div>

            <div className="space-y-6">
              <ProgressBar
                label="Organic Solutions Adopted"
                current={monthly_progress.organic_solutions.current}
                target={monthly_progress.organic_solutions.target}
                percentage={monthly_progress.organic_solutions.progress}
                color="green"
                icon={Sprout}
              />
              <ProgressBar
                label="Crop Health Monitoring"
                current={monthly_progress.crop_health_monitoring.current}
                target={monthly_progress.crop_health_monitoring.target}
                percentage={monthly_progress.crop_health_monitoring.progress}
                color="blue"
                icon={FlaskConical}
              />
              <ProgressBar
                label="Community Engagement"
                current={monthly_progress.community_engagement.current}
                target={monthly_progress.community_engagement.target}
                percentage={monthly_progress.community_engagement.progress}
                color="purple"
                icon={Users}
              />
              <ProgressBar
                label="Learning Sessions"
                current={monthly_progress.learning_sessions.current}
                target={monthly_progress.learning_sessions.target}
                percentage={monthly_progress.learning_sessions.progress}
                color="orange"
                icon={Video}
              />
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost Savings Breakdown */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-blue-600" />
                Cost Savings Breakdown
              </h3>
              <div className="space-y-3">
                {Object.entries(cost_savings.breakdown).map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700 capitalize">
                      {category.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      ₹{Math.round(amount).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="pt-3 border-t-2 border-gray-200">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="font-bold text-green-900">Total Saved</span>
                    <span className="text-xl font-bold text-green-600">
                      ₹{Math.round(cost_savings.total_saved).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Platform Activity
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.total_crops_monitored}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Crops Analyzed</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.treatments_applied}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Treatments Applied</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.videos_completed}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Videos Watched</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.consultations_received}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Consultations</div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          {timeline.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                Recent Activity
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {timeline.slice(0, 15).map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 p-2 rounded-lg transition"
                  >
                    <div className="text-2xl flex-shrink-0">{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{item.title}</div>
                      <div className="text-sm text-gray-600">{item.description}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(item.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${
                      item.type === 'crop_analysis' ? 'bg-blue-100 text-blue-800' :
                      item.type === 'solution_applied' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {item.type.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Environmental Tab */}
      {activeView === 'environmental' && (
        <>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Leaf className="w-6 h-6 text-green-600" />
              Your Environmental Impact
            </h2>
            <p className="text-gray-600 mb-6">
              Making a difference through sustainable farming practices
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <EnvironmentalCard
                icon={FlaskConical}
                label="Chemicals Reduced"
                value={`${environmental_impact.chemicals_reduced_kg}kg`}
                percentage={environmental_impact.chemical_reduction_percentage}
                color="red"
              />
              <EnvironmentalCard
                icon={Droplets}
                label="Water Saved"
                value={`${environmental_impact.water_saved_liters}L`}
                subtitle="through efficient practices"
                color="blue"
              />
              <EnvironmentalCard
                icon={Wind}
                label="Carbon Reduced"
                value={`${environmental_impact.carbon_reduced_kg}kg`}
                subtitle="CO₂ equivalent"
                color="purple"
              />
              <EnvironmentalCard
                icon={TreeDeciduous}
                label="Soil Health"
                value={`${environmental_impact.soil_health_score}%`}
                subtitle="improvement score"
                color="green"
              />
            </div>
          </div>

          {/* Environmental Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Chemical vs Organic</h3>
              <div className="space-y-4">
                <ComparisonBar
                  label="Cost per acre"
                  chemical="₹3,500"
                  organic="₹1,650"
                  savings="53%"
                />
                <ComparisonBar
                  label="Water usage"
                  chemical="1,000L"
                  organic="500L"
                  savings="50%"
                />
                <ComparisonBar
                  label="Soil degradation"
                  chemical="High"
                  organic="Low"
                  savings="80%"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Impact Equivalents</h3>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="font-semibold text-green-900">
                    {Math.round(environmental_impact.carbon_reduced_kg / 20)} trees planted
                  </div>
                  <div className="text-sm text-green-700">
                    equivalent CO₂ absorption
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-semibold text-blue-900">
                    {Math.round(environmental_impact.water_saved_liters / 150)} days of drinking water
                  </div>
                  <div className="text-sm text-blue-700">
                    for an average family
                  </div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="font-semibold text-purple-900">
                    {Math.round(environmental_impact.chemicals_reduced_kg / 5)} hectares protected
                  </div>
                  <div className="text-sm text-purple-700">
                    from chemical contamination
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Achievements Tab */}
      {activeView === 'achievements' && (
        <>
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-600" />
              Your Achievements
            </h2>
            <p className="text-gray-600">
              {achievements.length} badges earned • {stats.badges_earned} total milestones
            </p>
          </div>

          {achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement, idx) => (
                <div 
                  key={idx} 
                  className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition hover:border-yellow-300"
                >
                  <div className="text-5xl mb-3">{achievement.icon}</div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{achievement.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      achievement.category === 'analysis' ? 'bg-blue-100 text-blue-800' :
                      achievement.category === 'success' ? 'bg-green-100 text-green-800' :
                      achievement.category === 'organic' ? 'bg-emerald-100 text-emerald-800' :
                      achievement.category === 'traditional' ? 'bg-amber-100 text-amber-800' :
                      achievement.category === 'community' ? 'bg-purple-100 text-purple-800' :
                      achievement.category === 'learning' ? 'bg-cyan-100 text-cyan-800' :
                      achievement.category === 'environment' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {achievement.category}
                    </span>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <Award className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">Start your journey to earn achievements!</p>
            </div>
          )}

          {/* Progress to Next Achievement */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Next Milestones</h3>
            <div className="space-y-4">
              {stats.total_crops_monitored < 10 && (
                <MilestoneCard
                  title="Crop Monitor"
                  description="Analyze 10 crop photos"
                  current={stats.total_crops_monitored}
                  target={10}
                  icon="🌾"
                />
              )}
              {stats.organic_solutions_adopted < 5 && (
                <MilestoneCard
                  title="Organic Advocate"
                  description="Apply 5 organic solutions"
                  current={stats.organic_solutions_adopted}
                  target={5}
                  icon="🌱"
                />
              )}
              {stats.videos_completed < 10 && (
                <MilestoneCard
                  title="Knowledge Seeker"
                  description="Complete 10 video tutorials"
                  current={stats.videos_completed}
                  target={10}
                  icon="📚"
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Helper Components
const StatCard = ({ icon: Icon, label, value, subtitle, color, trend }) => {
  const colorClasses = {
    green: 'from-green-500 to-emerald-600',
    blue: 'from-blue-500 to-cyan-600',
    purple: 'from-purple-500 to-pink-600',
    orange: 'from-orange-500 to-red-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-gray-100 hover:shadow-lg transition">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-600">{label}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
      {trend && (
        <div className={`text-xs mt-2 flex items-center gap-1 font-medium ${
          trend === 'up' ? 'text-green-600' : 'text-gray-600'
        }`}>
          {trend === 'up' ? '↑' : '→'} {trend === 'up' ? 'Trending up' : 'Stable'}
        </div>
      )}
    </div>
  );
};

const ActivityCard = ({ icon: Icon, label, value, color }) => {
  const colorClasses = {
    green: 'bg-green-50 border-green-200 text-green-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700'
  };

  return (
    <div className={`rounded-xl border-2 p-4 ${colorClasses[color]}`}>
      <Icon className="w-6 h-6 mb-2" />
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm font-medium">{label}</div>
    </div>
  );
};

const ProgressBar = ({ label, current, target, percentage, color, icon: Icon }) => {
  const colorClasses = {
    green: 'bg-green-600',
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600'
  };

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-500" />
          <span className="text-gray-600 font-medium">{label}</span>
        </div>
        <span className="font-bold text-gray-900">{current}/{target}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className={`${colorClasses[color]} h-3 rounded-full transition-all duration-500`} 
          style={{width: `${Math.min(percentage, 100)}%`}}
        ></div>
      </div>
      <div className="text-xs text-gray-500 mt-1 text-right">{percentage.toFixed(0)}% complete</div>
    </div>
  );
};

const EnvironmentalCard = ({ icon: Icon, label, value, subtitle, percentage, color }) => {
  const colorClasses = {
    red: 'from-red-500 to-rose-600',
    blue: 'from-blue-500 to-cyan-600',
    purple: 'from-purple-500 to-pink-600',
    green: 'from-green-500 to-emerald-600'
  };

  return (
    <div className="bg-white rounded-xl p-6 border-2 border-gray-100">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-600">{label}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
      {percentage && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-600">{percentage}% reduction</div>
        </div>
      )}
    </div>
  );
};

const ComparisonBar = ({ label, chemical, organic, savings }) => {
  return (
    <div>
      <div className="text-sm font-medium text-gray-700 mb-2">{label}</div>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-red-100 rounded px-3 py-2 text-sm text-red-800">
          Chemical: {chemical}
        </div>
        <div className="flex-1 bg-green-100 rounded px-3 py-2 text-sm text-green-800">
          Organic: {organic}
        </div>
      </div>
     <div className="text-xs text-green-600 font-medium mt-1 text-right">
        💰 Save {savings}
      </div>
    </div>
  );
};

const MilestoneCard = ({ title, description, current, target, icon }) => {
  const percentage = (current / target) * 100;
  
  return (
    <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-yellow-300 transition">
      <div className="flex items-start gap-3">
        <div className="text-3xl">{icon}</div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600 mb-2">{description}</p>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                style={{width: `${percentage}%`}}
              ></div>
            </div>
            <span className="font-medium text-gray-700">{current}/{target}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactPage;