import React from 'react';
import { Home, Camera, BookOpen, Leaf, Calendar, Cloud, Video, Users, Phone, MapPin, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      active ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium">{label}</span>
  </button>
);

const Sidebar = ({ showMenu, setShowMenu, currentPage, setCurrentPage }) => {
  const { logout } = useAuth();

  const handleNavClick = (page) => {
    setCurrentPage(page);
    // Close mobile menu after selection
    if (window.innerWidth < 1024) {
      setShowMenu(false);
    }
  };

  return (
    <aside className={`${showMenu ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-16 left-0 w-64 bg-white h-screen border-r border-gray-200 overflow-y-auto z-40 transition-transform duration-300`}>
      <nav className="p-4 space-y-2">
        <NavItem 
          icon={Home} 
          label="Dashboard" 
          active={currentPage === 'home'} 
          onClick={() => handleNavClick('home')} 
        />
        <NavItem 
          icon={Camera} 
          label="Analyze Crop" 
          active={currentPage === 'analyze'} 
          onClick={() => handleNavClick('analyze')} 
        />
        <NavItem 
          icon={BookOpen} 
          label="Organic Solutions" 
          active={currentPage === 'solutions'} 
          onClick={() => handleNavClick('solutions')} 
        />
        <NavItem 
          icon={Leaf} 
          label="Traditional Knowledge" 
          active={currentPage === 'traditional'} 
          onClick={() => handleNavClick('traditional')} 
        />
        <NavItem 
          icon={Calendar} 
          label="Seasonal Calendar" 
          active={currentPage === 'calendar'} 
          onClick={() => handleNavClick('calendar')} 
        />
        <NavItem 
          icon={Cloud} 
          label="Weather Advisory" 
          active={currentPage === 'weather'} 
          onClick={() => handleNavClick('weather')} 
        />
        <NavItem 
          icon={Video} 
          label="Video Tutorials" 
          active={currentPage === 'tutorials'} 
          onClick={() => handleNavClick('tutorials')} 
        />
        <NavItem 
          icon={Users} 
          label="Community" 
          active={currentPage === 'community'} 
          onClick={() => handleNavClick('community')} 
        />
        <NavItem 
          icon={Phone} 
          label="Expert Consultation" 
          active={currentPage === 'consultation'} 
          onClick={() => handleNavClick('consultation')} 
        />
        <NavItem 
          icon={MapPin} 
          label="Suppliers" 
          active={currentPage === 'suppliers'} 
          onClick={() => handleNavClick('suppliers')} 
        />
        <NavItem 
          icon={TrendingUp} 
          label="My Impact" 
          active={currentPage === 'impact'} 
          onClick={() => handleNavClick('impact')} 
        />
        <NavItem 
          icon={TrendingUp} 
          label="Voice Assistant" 
          active={currentPage === 'VoiceAssistant'} 
          onClick={() => handleNavClick('VoiceAssistant')} 
        />
        
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;