import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Menu, 
  X, 
  Leaf, 
  LogOut, 
  Award,
  CloudRain,
  AlertTriangle,
  CheckCircle,
  Info,
  Trash2,
  TrendingUp
} from 'lucide-react';

// Mock auth hook for demo
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:8000';

const NotificationModal = ({ isOpen, onClose, notifications, onMarkAsRead, onDelete }) => {
  const [activeFilter, setActiveFilter] = useState('all');

  if (!isOpen) return null;

  const filterNotifications = () => {
    if (activeFilter === 'all') return notifications;
    return notifications.filter(n => n.type === activeFilter);
  };

  const filteredNotifications = filterNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'weather':
        return <CloudRain className="h-5 w-5 text-blue-600" />;
      case 'achievement':
        return <Award className="h-5 w-5 text-yellow-600" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-green-600" />;
      case 'milestone':
        return <TrendingUp className="h-5 w-5 text-purple-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'weather':
        return 'bg-blue-50 border-blue-200';
      case 'achievement':
        return 'bg-yellow-50 border-yellow-200';
      case 'alert':
        return 'bg-red-50 border-red-200';
      case 'info':
        return 'bg-green-50 border-green-200';
      case 'milestone':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-4 pt-20">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
              <p className="text-sm text-gray-600 mt-1">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'all', label: 'All', count: notifications.length },
              { id: 'weather', label: 'Weather', count: notifications.filter(n => n.type === 'weather').length },
              { id: 'achievement', label: 'Achievements', count: notifications.filter(n => n.type === 'achievement').length },
              { id: 'alert', label: 'Alerts', count: notifications.filter(n => n.type === 'alert').length },
              { id: 'info', label: 'Updates', count: notifications.filter(n => n.type === 'info').length }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === filter.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label} {filter.count > 0 && `(${filter.count})`}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No notifications</p>
              <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-2 rounded-xl p-4 transition-all ${
                    getNotificationStyle(notification.type)
                  } ${notification.read ? 'opacity-60' : 'shadow-sm'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-gray-500">
                          {new Date(notification.timestamp).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <div className="flex gap-2">
                          {!notification.read && (
                            <button
                              onClick={() => onMarkAsRead(notification.id)}
                              className="text-xs px-3 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <CheckCircle className="h-3 w-3 inline mr-1" />
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={() => onDelete(notification.id)}
                            className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {filteredNotifications.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                filteredNotifications.forEach(n => onMarkAsRead(n.id));
              }}
              className="w-full py-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
            >
              Mark all as read
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Header = ({ showMenu, setShowMenu }) => {
  const { user, logout, getToken } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 2 minutes
    const interval = setInterval(fetchNotifications, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch weather alerts
      const weatherRes = await fetch(`${API_BASE}/api/weather/alerts/active`, { headers });
      const weatherAlerts = weatherRes.ok ? await weatherRes.json() : [];

      // Transform weather alerts to notifications
      const weatherNotifications = weatherAlerts.map(alert => ({
        id: `weather-${alert.id}`,
        type: 'weather',
        title: `Weather Alert: ${alert.type}`,
        message: alert.message,
        timestamp: alert.timestamp,
        read: false,
        data: alert
      }));

      // Fetch achievements (if endpoint exists)
      // const achievementsRes = await fetch(`${API_BASE}/api/achievements/recent`, { headers });
      // const achievements = achievementsRes.ok ? await achievementsRes.json() : [];

      // Mock achievements for demo
      const achievementNotifications = [
        {
          id: 'achievement-1',
          type: 'achievement',
          title: 'Milestone Reached!',
          message: 'Congratulations! You have successfully completed 10 crop health reports.',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false
        }
      ];

      // Mock general notifications
      const generalNotifications = [
        {
          id: 'info-1',
          type: 'info',
          title: 'New Advisory Available',
          message: 'Expert advice on pest management for paddy crops is now available.',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          read: false
        }
      ];

      // Combine all notifications
      const allNotifications = [
        ...weatherNotifications,
        ...achievementNotifications,
        ...generalNotifications
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {showMenu ? <X /> : <Menu />}
            </button>
            <Leaf className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Tribal Organic Advisory</h1>
              <p className="text-xs text-gray-600">
                {user?.village && user?.district 
                  ? `${user.village}, ${user.district}` 
                  : user?.district || 'Location not set'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-6 h-6 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1 font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.name || user?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-600 capitalize">{user?.role || 'farmer'}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
            </button>
          </div>
        </div>
      </header>

      <NotificationModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDelete}
      />
    </>
  );
};

export default Header;