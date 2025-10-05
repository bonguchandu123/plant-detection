import React, { useState, useEffect } from 'react';
import { 
  ThermometerSun, 
  Droplets, 
  Cloud, 
  Wind, 
  AlertTriangle, 
  Calendar,
  TrendingUp,
  Settings,
  Bell,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:8000';

const WeatherCard = ({ icon: Icon, label, value, unit = '', color = 'blue' }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-3">
      <Icon className={`h-8 w-8 text-${color}-600`} />
      <span className="text-3xl font-bold text-gray-900">{value}{unit}</span>
    </div>
    <p className="text-sm text-gray-600 font-medium">{label}</p>
  </div>
);

const AlertCard = ({ alert, onAcknowledge }) => {
  const severityConfig = {
    urgent: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', icon: 'text-red-600' },
    high: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900', icon: 'text-orange-600' },
    medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900', icon: 'text-yellow-600' },
    low: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', icon: 'text-blue-600' }
  };

  const config = severityConfig[alert.severity] || severityConfig.medium;

  return (
    <div className={`${config.bg} ${config.border} border rounded-xl p-6`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className={`h-6 w-6 mt-1 ${config.icon}`} />
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className={`font-semibold ${config.text}`}>
              {alert.type.toUpperCase()} Alert
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.text} font-medium`}>
              {alert.severity}
            </span>
          </div>
          <p className={`text-sm mb-3 ${config.text}`}>{alert.message}</p>
          {alert.recommended_action && (
            <div className="mb-3">
              <p className={`text-sm font-medium ${config.text} mb-1`}>Recommended Action:</p>
              <p className="text-sm text-gray-700">{alert.recommended_action}</p>
            </div>
          )}
          {alert.affected_crops && alert.affected_crops.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-600">Affected Crops: {alert.affected_crops.join(', ')}</p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {new Date(alert.timestamp).toLocaleString()}
            </p>
            <button
              onClick={() => onAcknowledge(alert.id)}
              className="text-xs px-3 py-1 bg-white rounded-lg hover:bg-gray-50 border border-gray-300"
            >
              Acknowledge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdvisoryCard = ({ advisory }) => (
  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
    <div className="flex items-start justify-between mb-3">
      <h3 className="font-semibold text-green-900">{advisory.message}</h3>
      <span className={`text-xs px-2 py-1 rounded-full ${
        advisory.priority === 'high' ? 'bg-red-100 text-red-800' :
        advisory.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
        'bg-blue-100 text-blue-800'
      }`}>
        {advisory.priority}
      </span>
    </div>
    <ul className="space-y-2">
      {advisory.recommendations.map((rec, i) => (
        <li key={i} className="flex items-start gap-2 text-green-800 text-sm">
          <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{rec}</span>
        </li>
      ))}
    </ul>
  </div>
);

const PreferencesModal = ({ isOpen, onClose, preferences, onSave }) => {
  const [formData, setFormData] = useState(preferences);

  useEffect(() => {
    setFormData(preferences);
  }, [preferences]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Weather Alert Preferences</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Alert Types</h3>
            <div className="space-y-2">
              {[
                { key: 'enable_weather_alerts', label: 'General Weather Alerts' },
                { key: 'enable_rainfall_alerts', label: 'Rainfall Alerts' },
                { key: 'enable_temperature_alerts', label: 'Temperature Alerts' },
                { key: 'enable_storm_alerts', label: 'Storm Alerts' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={formData[key]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })}
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Alert Thresholds</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">High Temperature (°C)</label>
                <input
                  type="number"
                  value={formData.high_temp_threshold}
                  onChange={(e) => setFormData({ ...formData, high_temp_threshold: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Low Temperature (°C)</label>
                <input
                  type="number"
                  value={formData.low_temp_threshold}
                  onChange={(e) => setFormData({ ...formData, low_temp_threshold: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Heavy Rain Threshold (mm)</label>
                <input
                  type="number"
                  value={formData.heavy_rain_threshold}
                  onChange={(e) => setFormData({ ...formData, heavy_rain_threshold: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Alert Timing</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.morning_alert}
                  onChange={(e) => setFormData({ ...formData, morning_alert: e.target.checked })}
                  className="w-4 h-4 text-green-600"
                />
                <span className="text-sm text-gray-700">Morning Alerts (6-10 AM)</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.evening_alert}
                  onChange={(e) => setFormData({ ...formData, evening_alert: e.target.checked })}
                  className="w-4 h-4 text-green-600"
                />
                <span className="text-sm text-gray-700">Evening Alerts (5-8 PM)</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => onSave(formData)}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              Save Preferences
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const WeatherAdvisoryPage = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [advisory, setAdvisory] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPreferences, setShowPreferences] = useState(false);
  const [activeTab, setActiveTab] = useState('current'); 
  const {getToken} = useAuth()
  const token = getToken()// current, forecast, alerts

  useEffect(() => {
    fetchWeatherData();
    fetchPreferences();
  }, []);

  const getHeaders = () => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  const fetchWeatherData = async () => {
    try {
      const headers = getHeaders();

      const [currentRes, forecastRes, alertsRes, advisoryRes] = await Promise.all([
        fetch(`${API_BASE}/api/weather/current`, { headers }),
        fetch(`${API_BASE}/api/weather/forecast`, { headers }),
        fetch(`${API_BASE}/api/weather/alerts/active`, { headers }),
        fetch(`${API_BASE}/api/weather/advisory`, { headers })
      ]);

      if (currentRes.ok) setCurrentWeather(await currentRes.json());
      if (forecastRes.ok) {
        const data = await forecastRes.json();
        setForecast(data.forecast || []);
      }
      if (alertsRes.ok) setAlerts(await alertsRes.json());
      if (advisoryRes.ok) setAdvisory(await advisoryRes.json());

      setLoading(false);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/weather/preferences`, {
        headers: getHeaders()
      });
      if (res.ok) {
        setPreferences(await res.json());
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const handleAcknowledge = async (alertId) => {
    try {
      const res = await fetch(`${API_BASE}/api/weather/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: getHeaders()
      });
      if (res.ok) {
        setAlerts(alerts.filter(a => a.id !== alertId));
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const handleSavePreferences = async (newPreferences) => {
    try {
      const res = await fetch(`${API_BASE}/api/weather/preferences`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(newPreferences)
      });
      if (res.ok) {
        setPreferences(newPreferences);
        setShowPreferences(false);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Weather Advisory</h2>
        <button
          onClick={() => setShowPreferences(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Settings className="h-4 w-4" />
          <span className="text-sm">Preferences</span>
        </button>
      </div>

      {/* Location Info */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">
              {currentWeather?.location || 'Loading...'}
            </h3>
            <p className="text-blue-700 text-sm">
              {currentWeather?.description || ''} • Last updated: {
                currentWeather ? new Date(currentWeather.last_updated).toLocaleString() : 'Loading...'
              }
            </p>
          </div>
          <button
            onClick={fetchWeatherData}
            className="px-3 py-1 bg-white rounded-lg text-sm hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { id: 'current', label: 'Current Weather', icon: ThermometerSun },
          { id: 'forecast', label: '7-Day Forecast', icon: Calendar },
          { id: 'alerts', label: `Alerts (${alerts.length})`, icon: Bell }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === id
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Current Weather Tab */}
      {activeTab === 'current' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <WeatherCard 
              icon={ThermometerSun} 
              label="Temperature" 
              value={currentWeather?.temperature || '--'} 
              unit="°C"
              color="orange"
            />
            <WeatherCard 
              icon={Droplets} 
              label="Humidity" 
              value={currentWeather?.humidity || '--'} 
              unit="%"
              color="blue"
            />
            <WeatherCard 
              icon={Cloud} 
              label="Rainfall" 
              value={currentWeather?.rainfall || '0'} 
              unit="mm"
              color="indigo"
            />
            <WeatherCard 
              icon={Wind} 
              label="Wind Speed" 
              value={currentWeather?.wind_speed || '--'} 
              unit=" km/h"
              color="cyan"
            />
          </div>

          {advisory?.advisories && advisory.advisories.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Farming Advisory</h3>
              {advisory.advisories.map((adv, idx) => (
                <AdvisoryCard key={idx} advisory={adv} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Forecast Tab */}
      {activeTab === 'forecast' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">7-Day Weather Forecast</h3>
          <div className="space-y-3">
            {forecast.map((day, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <span className="font-semibold text-gray-900 w-12">{day.day}</span>
                  <span className="text-sm text-gray-600 w-24">{day.date}</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-lg font-semibold text-gray-900">
                      {day.temp_min}° - {day.temp_max}°C
                    </span>
                  </div>
                  <span className="text-blue-600 font-medium w-32 text-right">{day.conditions}</span>
                  {day.rainfall_mm > 0 && (
                    <div className="flex items-center gap-1 text-blue-500">
                      <Droplets className="h-4 w-4" />
                      <span className="text-sm">{day.rainfall_mm}mm</span>
                    </div>
                  )}
                  <span className="text-sm text-gray-500 w-20 text-right">{day.humidity}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Info className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No active weather alerts</p>
              <p className="text-sm text-gray-500 mt-1">You'll be notified when weather conditions require attention</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <AlertCard 
                key={alert.id} 
                alert={alert} 
                onAcknowledge={handleAcknowledge}
              />
            ))
          )}
        </div>
      )}

      {/* Preferences Modal */}
      {preferences && (
        <PreferencesModal
          isOpen={showPreferences}
          onClose={() => setShowPreferences(false)}
          preferences={preferences}
          onSave={handleSavePreferences}
        />
      )}
    </div>
  );
};