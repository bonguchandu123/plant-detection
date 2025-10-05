import React from 'react';
import { Camera, Check, BookOpen, Award, Phone, Cloud, Video } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StatCard, QuickActionButton, ActivityItem } from '../components/shared';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name || user?.full_name || 'Farmer'}!
        </h2>
        <p className="text-green-100">Let's make your farming organic and sustainable</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Camera} label="Crop Analyses" value="12" color="blue" />
        <StatCard icon={Check} label="Issues Resolved" value="9" color="green" />
        <StatCard icon={BookOpen} label="Solutions Used" value="15" color="purple" />
        <StatCard icon={Award} label="Success Rate" value="75%" color="orange" />
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <QuickActionButton 
              icon={Camera} 
              label="Analyze New Crop Issue" 
              onClick={() => console.log('Navigate to analyze')}
            />
            <QuickActionButton 
              icon={Phone} 
              label="Request Expert Consultation" 
              onClick={() => console.log('Navigate to consultation')}
            />
            <QuickActionButton 
              icon={Cloud} 
              label="Check Weather Advisory" 
              onClick={() => console.log('Navigate to weather')}
            />
            <QuickActionButton 
              icon={Video} 
              label="Watch Tutorial Videos" 
              onClick={() => console.log('Navigate to tutorials')}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <ActivityItem 
              title="Analyzed Rice Crop"
              description="Detected: Bacterial Leaf Blight"
              time="2 hours ago"
            />
            <ActivityItem 
              title="Applied Neem Solution"
              description="Day 3 - Showing improvement"
              time="1 day ago"
            />
            <ActivityItem 
              title="Community Post"
              description="Shared success story"
              time="3 days ago"
            />
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="font-semibold text-yellow-900 mb-3">💡 Tip of the Day</h3>
        <p className="text-yellow-800 text-sm">
          Early morning is the best time to inspect your crops for pest damage. 
          Pests are more active during this time, making them easier to spot.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;