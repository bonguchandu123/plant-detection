import React from 'react';
import { Bell, Menu, X, Leaf, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ showMenu, setShowMenu }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
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
          <button className="relative p-2 hover:bg-gray-100 rounded-lg">
            <Bell className="w-6 h-6 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
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
            <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-600" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;