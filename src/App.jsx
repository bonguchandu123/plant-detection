import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import AnalyzeCropPage from './pages/AnalyzeCropPage';
import OrganicSolutionsPage from './pages/OrganicSolution';
import TraditionalKnowledgePage from './pages/TraditionalKnowledgePage';
import WeatherAdvisoryPage from './pages/WeatherAdvisoryPage';
import ImpactPage from './pages/ImpactPage';
import SuppliersPages from './pages/SuppliersPage';
import AuthPage from './pages/AuthPage';
import AuthProvider, { useAuth } from './context/AuthContext';
import SeasonalCalendarPage from './pages/SeasonalCalendarPage';
import VideoTutorialsPage from './pages/VideoTutorialsPage';
import CommunityPage from './pages/CommunityPage';
import ConsultationPage from './pages/ConsultationPage';
import ProductMarketplace from './pages/Product';
import VoiceAgent from './pages/VoiceAssistant';
import Chatbot from './components/Chatbot';

const AppContent = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [showMenu, setShowMenu] = useState(false);

  // If not logged in, show auth page (no voice agent on auth page)
  if (!user) {
    return <AuthPage />;
  }

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <DashboardPage setCurrentPage={setCurrentPage} />;
      case 'analyze':
        return <AnalyzeCropPage />;
      case 'solutions':
        return <OrganicSolutionsPage />;
      case 'traditional':
        return <TraditionalKnowledgePage />;
      case 'calendar':
        return <SeasonalCalendarPage />;
      case 'weather':
        return <WeatherAdvisoryPage />;
      case 'tutorials':
        return <VideoTutorialsPage />;
      case 'community':
        return <CommunityPage />;
      case 'consultation':
        return <ConsultationPage />;
      case 'suppliers':
        return <SuppliersPages />;
      case 'impact':
        return <ImpactPage />;
      case 'product':
        return <ProductMarketplace />;
      default:
        return <DashboardPage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showMenu={showMenu} setShowMenu={setShowMenu} />
      
      <div className="flex">
        <Sidebar 
          showMenu={showMenu} 
          setShowMenu={setShowMenu}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
        
        <main className="flex-1 p-6">
          {renderPage()}
        </main>
      </div>

      {/* 🤖 AI Chatbot - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <Chatbot />
      </div>

      {/* 🎤 Voice Agent - Bottom Left */}
      <div className="fixed bottom-6 left-6 z-[100]">
        <VoiceAgent />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;