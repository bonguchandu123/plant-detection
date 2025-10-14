import React, { useState, useEffect } from 'react';
import { 
  Camera, Check, BookOpen, Award, Phone, Cloud, Video, TrendingUp, 
  Leaf, Droplet, Sun, Wind, AlertTriangle, Users, MessageCircle,
  BarChart3, PieChart, Activity, Calendar, Target, Zap, Globe,
  ChevronRight, ArrowUp, DollarSign, Sprout, Heart, Shield, Languages
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:8000';

// Translation dictionary
const translations = {
  en: {
    welcomeBack: "Welcome back",
    season: "Season",
    dayStreak: "Day Streak",
    humidity: "Humidity",
    wind: "Wind",
    cropsMonitored: "Crops Monitored",
    totalAnalyses: "Total analyses",
    successRate: "Success Rate",
    treatmentSuccess: "Treatment success",
    costSaved: "Cost Saved",
    totalSavings: "Total savings",
    chemicalReduction: "Chemical Reduction",
    goingOrganic: "Going organic",
    environmentalImpact: "Your Environmental Impact",
    badges: "Badges",
    chemicalsReduced: "Chemicals Reduced",
    waterSaved: "Water Saved",
    soilHealth: "Soil Health",
    carbonReduced: "Carbon Reduced",
    costSavingsBreakdown: "Cost Savings Breakdown",
    organicPesticides: "Organic Pesticides",
    organicFertilizers: "Organic Fertilizers",
    laborReduction: "Labor Reduction",
    cropLossPrevention: "Crop Loss Prevention",
    monthlyGoals: "This Month's Goals",
    organicSolutions: "Organic Solutions",
    cropMonitoring: "Crop Monitoring",
    communityEngagement: "Community Engagement",
    learningSessions: "Learning Sessions",
    recentAchievements: "Recent Achievements",
    completeActivities: "Complete activities to earn badges!",
    quickActions: "Quick Actions",
    analyzeCrop: "Analyze Crop",
    expertCall: "Expert Call",
    tutorials: "Tutorials",
    community: "Community",
    calendar: "Calendar",
    seasonAdvisory: "Season Advisory",
    recommendedCrops: "Recommended Crops:",
    rainAlert: "Rain Alert",
    postponePesticide: "Postpone pesticide application. Good time for transplanting!",
    platformActivity: "Platform Activity Overview",
    analyses: "Analyses",
    treatments: "Treatments",
    organic: "Organic",
    traditional: "Traditional",
    videos: "Videos",
    posts: "Posts",
    consults: "Consults"
  },
  te: {
    welcomeBack: "స్వాగతం",
    season: "సీజన్",
    dayStreak: "రోజుల పరంపర",
    humidity: "తేమ",
    wind: "గాలి",
    cropsMonitored: "పర్యవేక్షించిన పంటలు",
    totalAnalyses: "మొత్తం విశ్లేషణలు",
    successRate: "విజయ రేటు",
    treatmentSuccess: "చికిత్స విజయం",
    costSaved: "ఆదా అయిన ఖర్చు",
    totalSavings: "మొత్తం పొదుపు",
    chemicalReduction: "రసాయన తగ్గింపు",
    goingOrganic: "సేంద్రీయంగా మారుతోంది",
    environmentalImpact: "మీ పర్యావరణ ప్రభావం",
    badges: "బ్యాడ్జీలు",
    chemicalsReduced: "తగ్గించిన రసాయనాలు",
    waterSaved: "ఆదా చేసిన నీరు",
    soilHealth: "నేల ఆరోగ్యం",
    carbonReduced: "తగ్గించిన కార్బన్",
    costSavingsBreakdown: "ఖర్చు పొదుపు వివరాలు",
    organicPesticides: "సేంద్రీయ పురుగుమందులు",
    organicFertilizers: "సేంద్రీయ ఎరువులు",
    laborReduction: "కూలి తగ్గింపు",
    cropLossPrevention: "పంట నష్ట నివారణ",
    monthlyGoals: "ఈ నెల లక్ష్యాలు",
    organicSolutions: "సేంద్రీయ పరిష్కారాలు",
    cropMonitoring: "పంట పర్యవేక్షణ",
    communityEngagement: "సమాజ భాగస్వామ్యం",
    learningSessions: "అభ్యాస సెషన్లు",
    recentAchievements: "ఇటీవలి విజయాలు",
    completeActivities: "బ్యాడ్జీలు సంపాదించడానికి కార్యకలాపాలు పూర్తి చేయండి!",
    quickActions: "త్వరిత చర్యలు",
    analyzeCrop: "పంట విశ్లేషణ",
    expertCall: "నిపుణుల సంప్రదింపు",
    tutorials: "శిక్షణా వీడియోలు",
    community: "సంఘం",
    calendar: "క్యాలెండర్",
    seasonAdvisory: "సీజన్ సలహా",
    recommendedCrops: "సిఫారసు చేసిన పంటలు:",
    rainAlert: "వర్షం హెచ్చరిక",
    postponePesticide: "పురుగుమందు ప్రయోగం వాయిదా వేయండి. నాటడానికి మంచి సమయం!",
    platformActivity: "ప్లాట్‌ఫారమ్ కార్యకలాపాల సారాంశం",
    analyses: "విశ్లేషణలు",
    treatments: "చికిత్సలు",
    organic: "సేంద్రీయ",
    traditional: "సాంప్రదాయ",
    videos: "వీడియోలు",
    posts: "పోస్ట్‌లు",
    consults: "సంప్రదింపులు"
  }
};

const DashboardPage = ({ setCurrentPage }) => {
  const [impactData, setImpactData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [seasonalInfo, setSeasonalInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('en');
  const {getToken} = useAuth()

  const t = translations[language];

  // Replace with actual useAuth hook
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const [impactRes, weatherRes, seasonRes] = await Promise.all([
        fetch(`${API_BASE}/api/impact/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/api/weather/current`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/api/seasonal-calendar/current`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (impactRes.ok) {
        const impact = await impactRes.json();
        setImpactData(impact);
      }
      if (weatherRes.ok) {
        const weather = await weatherRes.json();
        setWeatherData(weather);
      }
      if (seasonRes.ok) {
        const season = await seasonRes.json();
        setSeasonalInfo(season);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'te' : 'en');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const stats = impactData?.stats || {};
  const monthlyProgress = impactData?.monthly_progress || {};
  const costSavings = impactData?.cost_savings || {};
  const envImpact = impactData?.environmental_impact || {};
  const achievements = impactData?.achievements || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Language Toggle Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-green-200"
          >
            <Languages className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-gray-700">
              {language === 'en' ? 'తెలుగు' : 'English'}
            </span>
          </button>
        </div>

        {/* Hero Welcome Section */}
        <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600">
          <div className="relative z-10 p-8 text-white">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  {t.welcomeBack}, {user?.name || 'Farmer'}!
                </h1>
                <p className="text-green-100 text-lg">
                  {user?.village}, {user?.district} • {seasonalInfo?.season || 'Kharif'} {t.season}
                </p>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.streak_days || 0}</div>
                  <div className="text-sm text-green-100">{t.dayStreak}</div>
                </div>
              </div>
            </div>
            
            {weatherData && (
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-4 mt-4 inline-flex items-center gap-4">
                <Sun className="w-8 h-8" />
                <div>
                  <div className="text-2xl font-bold">{weatherData.temperature}°C</div>
                  <div className="text-sm text-green-100">{weatherData.description}</div>
                </div>
                <div className="border-l border-white border-opacity-30 pl-4 ml-4">
                  <Droplet className="w-5 h-5 inline mr-2" />
                  {weatherData.humidity}% {t.humidity}
                </div>
                <div className="border-l border-white border-opacity-30 pl-4 ml-4">
                  <Wind className="w-5 h-5 inline mr-2" />
                  {weatherData.wind_speed} km/h {t.wind}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={Camera}
            label={t.cropsMonitored}
            value={stats.total_crops_monitored || 0}
            change="+12%"
            color="from-blue-500 to-blue-600"
            description={t.totalAnalyses}
          />
          <MetricCard
            icon={Check}
            label={t.successRate}
            value={`${stats.success_rate || 0}%`}
            change="+8%"
            color="from-green-500 to-green-600"
            description={t.treatmentSuccess}
          />
          <MetricCard
            icon={DollarSign}
            label={t.costSaved}
            value={`₹${(stats.cost_saved || 0).toLocaleString()}`}
            change="+25%"
            color="from-purple-500 to-purple-600"
            description={t.totalSavings}
          />
          <MetricCard
            icon={Leaf}
            label={t.chemicalReduction}
            value={`${stats.chemical_reduction || 0}%`}
            change="+15%"
            color="from-emerald-500 to-emerald-600"
            description={t.goingOrganic}
          />
        </div>

        {/* Impact Dashboard & Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Environmental Impact */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Globe className="w-7 h-7 text-green-600" />
                {t.environmentalImpact}
              </h2>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                +{achievements.length} {t.badges}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <ImpactCard
                icon={Shield}
                label={t.chemicalsReduced}
                value={`${envImpact.chemicals_reduced_kg || 0} kg`}
                progress={envImpact.chemical_reduction_percentage || 0}
                color="green"
              />
              <ImpactCard
                icon={Droplet}
                label={t.waterSaved}
                value={`${envImpact.water_saved_liters || 0}L`}
                progress={Math.min((envImpact.water_saved_liters || 0) / 50, 100)}
                color="blue"
              />
              <ImpactCard
                icon={Sprout}
                label={t.soilHealth}
                value={`${envImpact.soil_health_score || 0}%`}
                progress={envImpact.soil_health_score || 0}
                color="emerald"
              />
              <ImpactCard
                icon={Cloud}
                label={t.carbonReduced}
                value={`${envImpact.carbon_reduced_kg || 0} kg`}
                progress={Math.min((envImpact.carbon_reduced_kg || 0) / 10, 100)}
                color="purple"
              />
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                {t.costSavingsBreakdown}
              </h3>
              <div className="space-y-2">
                <SavingsBar 
                  label={t.organicPesticides}
                  amount={costSavings.breakdown?.organic_pesticides_savings || 0}
                  total={costSavings.total_saved || 1}
                />
                <SavingsBar 
                  label={t.organicFertilizers}
                  amount={costSavings.breakdown?.organic_fertilizers_savings || 0}
                  total={costSavings.total_saved || 1}
                />
                <SavingsBar 
                  label={t.laborReduction}
                  amount={costSavings.breakdown?.labor_cost_reduction || 0}
                  total={costSavings.total_saved || 1}
                />
                <SavingsBar 
                  label={t.cropLossPrevention}
                  amount={costSavings.breakdown?.crop_loss_prevention || 0}
                  total={costSavings.total_saved || 1}
                />
              </div>
            </div>
          </div>

          {/* Monthly Progress & Achievements */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-600" />
                {t.monthlyGoals}
              </h3>
              <div className="space-y-4">
                <ProgressGoal
                  label={t.organicSolutions}
                  current={monthlyProgress.organic_solutions?.current || 0}
                  target={monthlyProgress.organic_solutions?.target || 10}
                  progress={monthlyProgress.organic_solutions?.progress || 0}
                  icon={Leaf}
                  color="green"
                />
                <ProgressGoal
                  label={t.cropMonitoring}
                  current={monthlyProgress.crop_health_monitoring?.current || 0}
                  target={monthlyProgress.crop_health_monitoring?.target || 8}
                  progress={monthlyProgress.crop_health_monitoring?.progress || 0}
                  icon={Camera}
                  color="blue"
                />
                <ProgressGoal
                  label={t.communityEngagement}
                  current={monthlyProgress.community_engagement?.current || 0}
                  target={monthlyProgress.community_engagement?.target || 5}
                  progress={monthlyProgress.community_engagement?.progress || 0}
                  icon={Users}
                  color="purple"
                />
                <ProgressGoal
                  label={t.learningSessions}
                  current={monthlyProgress.learning_sessions?.current || 0}
                  target={monthlyProgress.learning_sessions?.target || 3}
                  progress={monthlyProgress.learning_sessions?.progress || 0}
                  icon={BookOpen}
                  color="orange"
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-yellow-600" />
                {t.recentAchievements}
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {achievements.slice(0, 5).map((achievement, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-3 flex items-center gap-3 hover:shadow-md transition-shadow">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{achievement.title}</div>
                      <div className="text-sm text-gray-600">{achievement.description}</div>
                    </div>
                  </div>
                ))}
                {achievements.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">{t.completeActivities}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-600" />
              {t.quickActions}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <ActionButton 
                icon={Camera} 
                label={t.analyzeCrop}
                color="blue"
                onClick={() => setCurrentPage && setCurrentPage('analyze')}
              />
              <ActionButton 
                icon={Leaf} 
                label={t.organicSolutions}
                color="green"
                onClick={() => setCurrentPage && setCurrentPage('solutions')}
              />
              <ActionButton 
                icon={Phone} 
                label={t.expertCall}
                color="purple"
                onClick={() => setCurrentPage && setCurrentPage('consultation')}
              />
              <ActionButton 
                icon={Video} 
                label={t.tutorials}
                color="red"
                onClick={() => setCurrentPage && setCurrentPage('tutorials')}
              />
              <ActionButton 
                icon={Users} 
                label={t.community}
                color="indigo"
                onClick={() => setCurrentPage && setCurrentPage('community')}
              />
              <ActionButton 
                icon={Calendar} 
                label={t.calendar}
                color="orange"
                onClick={() => setCurrentPage && setCurrentPage('calendar')}
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border-2 border-green-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sun className="w-6 h-6 text-yellow-600" />
              {seasonalInfo?.season || 'Kharif'} {t.seasonAdvisory}
            </h3>
            <p className="text-gray-700 mb-4">{seasonalInfo?.description}</p>
            
            <div className="bg-white rounded-xl p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">{t.recommendedCrops}</h4>
              <div className="flex flex-wrap gap-2">
                {(seasonalInfo?.recommended_crops || []).map((crop, idx) => (
                  <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {crop}
                  </span>
                ))}
              </div>
            </div>

            {weatherData?.rainfall > 0 && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
                <div className="flex items-start gap-3">
                  <Droplet className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900">{t.rainAlert}</p>
                    <p className="text-sm text-blue-700">{t.postponePesticide}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Activity Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-600" />
            {t.platformActivity}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <StatPill icon={Camera} label={t.analyses} value={stats.total_crops_monitored || 0} />
            <StatPill icon={Check} label={t.treatments} value={stats.treatments_applied || 0} />
            <StatPill icon={Leaf} label={t.organic} value={stats.organic_solutions_adopted || 0} />
            <StatPill icon={BookOpen} label={t.traditional} value={stats.traditional_practices_used || 0} />
            <StatPill icon={Video} label={t.videos} value={stats.videos_completed || 0} />
            <StatPill icon={MessageCircle} label={t.posts} value={stats.community_contributions || 0} />
            <StatPill icon={Phone} label={t.consults} value={stats.consultations_received || 0} />
          </div>
        </div>

      </div>
    </div>
  );
};

const MetricCard = ({ icon: Icon, label, value, change, color, description }) => (
  <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}>
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>
      <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs font-semibold flex items-center gap-1">
        <ArrowUp className="w-3 h-3" />
        {change}
      </span>
    </div>
    <div className="text-3xl font-bold mb-1">{value}</div>
    <div className="text-sm opacity-90">{label}</div>
    <div className="text-xs opacity-75 mt-1">{description}</div>
  </div>
);

const ImpactCard = ({ icon: Icon, label, value, progress, color }) => {
  const colorMap = {
    green: { bg: 'bg-green-100', text: 'text-green-600', bar: 'bg-green-500' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', bar: 'bg-blue-500' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', bar: 'bg-emerald-500' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', bar: 'bg-purple-500' }
  };
  const colors = colorMap[color] || colorMap.green;
  
  return (
    <div className="bg-white rounded-xl p-4 border-2 border-gray-100 hover:border-gray-200 transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
        <div>
          <div className="text-sm text-gray-600">{label}</div>
          <div className="text-xl font-bold text-gray-900">{value}</div>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`${colors.bar} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

const SavingsBar = ({ label, amount, total }) => {
  const percentage = total > 0 ? (amount / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className="text-purple-600 font-semibold">₹{amount.toFixed(0)}</span>
      </div>
      <div className="w-full bg-white rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const ProgressGoal = ({ label, current, target, progress, icon: Icon, color }) => {
  const colorMap = {
    green: { icon: 'text-green-600', bar: 'bg-green-500' },
    blue: { icon: 'text-blue-600', bar: 'bg-blue-500' },
    purple: { icon: 'text-purple-600', bar: 'bg-purple-500' },
    orange: { icon: 'text-orange-600', bar: 'bg-orange-500' }
  };
  const colors = colorMap[color] || colorMap.green;
  
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${colors.icon}`} />
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <span className="text-xs text-gray-600">{current}/{target}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`${colors.bar} h-2.5 rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

const ActionButton = ({ icon: Icon, label, color, onClick }) => {
  const colorMap = {
    blue: 'from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-200 text-blue-600',
    green: 'from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-green-200 text-green-600',
    purple: 'from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-purple-200 text-purple-600',
    red: 'from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border-red-200 text-red-600',
    indigo: 'from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 border-indigo-200 text-indigo-600',
    orange: 'from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border-orange-200 text-orange-600'
  };
  const classes = colorMap[color] || colorMap.blue;
  
  return (
    <button
      onClick={onClick}
      className={`p-4 bg-gradient-to-br ${classes} rounded-xl flex flex-col items-center gap-2 transition-all hover:shadow-md border-2`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-sm font-semibold text-gray-900">{label}</span>
    </button>
  );
};

const StatPill = ({ icon: Icon, label, value }) => (
  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 text-center">
    <Icon className="w-6 h-6 text-gray-600 mx-auto mb-2" />
    <div className="text-2xl font-bold text-gray-900">{value}</div>
    <div className="text-xs text-gray-600 mt-1">{label}</div>
  </div>
);

export default DashboardPage;