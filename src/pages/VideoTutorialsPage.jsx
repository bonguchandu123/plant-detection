import React, { useState, useEffect } from 'react';
import { Video, Play, Clock, Eye, ThumbsUp, Star, Upload, Search, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:8000/api';

const VideoTutorialsPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    language: '',
    difficulty: '',
    search: ''
  });
  const [categories, setCategories] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const { getToken } = useAuth();

  const token = getToken();

  useEffect(() => {
    fetchVideos();
    fetchCategories();
    fetchUserProgress();
  }, [filters]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.language) params.append('language', filters.language);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);

      const response = await fetch(`${API_BASE_URL}/video-tutorials?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setVideos(data);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedVideos = async () => {
    if (!window.confirm('This will add sample video tutorials to your database. Continue?')) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/seed-video-tutorials`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchVideos();
        alert('Sample video tutorials added successfully!');
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to seed videos');
      }
    } catch (error) {
      console.error('Error seeding videos:', error);
      alert('Failed to seed videos');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/video-tutorials/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/video-tutorials/my-progress`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const progressMap = {};
        data.forEach(item => {
          progressMap[item.video_id] = item;
        });
        setUserProgress(progressMap);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const fetchVideoDetail = async (videoId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/video-tutorials/${videoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedVideo(data);
      }
    } catch (error) {
      console.error('Error fetching video detail:', error);
    }
  };

  const likeVideo = async (videoId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/video-tutorials/${videoId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        fetchVideos();
      }
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const updateProgress = async (videoId, watchedSeconds, totalSeconds) => {
    try {
      await fetch(`${API_BASE_URL}/video-tutorials/${videoId}/progress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          watched_duration_seconds: watchedSeconds,
          total_duration_seconds: totalSeconds
        })
      });
      fetchUserProgress();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const filteredVideos = videos.filter(video => {
    if (filters.search) {
      return video.title.toLowerCase().includes(filters.search.toLowerCase()) ||
             video.description.toLowerCase().includes(filters.search.toLowerCase());
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Video Tutorials</h1>
            <p className="text-gray-600 mt-1">Learn organic farming techniques</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSeedVideos}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Video className="w-5 h-5" />
              Seed Data
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload Video
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search videos..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.category} value={cat.category}>
                  {cat.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} ({cat.count})
                </option>
              ))}
            </select>

            {/* Language Filter */}
            <select
              value={filters.language}
              onChange={(e) => setFilters({...filters, language: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Languages</option>
              <option value="telugu">Telugu</option>
              <option value="hindi">Hindi</option>
              <option value="english">English</option>
            </select>

            {/* Difficulty Filter */}
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Video Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading videos...</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Video size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No videos found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or add sample videos</p>
            <button
              onClick={handleSeedVideos}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Add Sample Videos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                progress={userProgress[video.id]}
                onPlay={() => fetchVideoDetail(video.id)}
                onLike={() => likeVideo(video.id)}
              />
            ))}
          </div>
        )}

        {/* Video Player Modal */}
        {selectedVideo && (
          <VideoPlayerModal
            video={selectedVideo}
            onClose={() => setSelectedVideo(null)}
            onUpdateProgress={updateProgress}
          />
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <UploadModal 
            onClose={() => setShowUploadModal(false)} 
            onSuccess={fetchVideos} 
          />
        )}
      </div>
    </div>
  );
};

// Video Card Component
const VideoCard = ({ video, progress, onPlay, onLike }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
      <div className="relative h-48 bg-gradient-to-br from-green-400 to-emerald-600">
        {video.thumbnail_url ? (
          <img 
            src={video.thumbnail_url} 
            alt={video.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Video className="w-16 h-16 text-white opacity-50" />
          </div>
        )}
        
        {video.is_featured && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-bold">
            FEATURED
          </div>
        )}
        
        {progress && progress.completed && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs">
            <CheckCircle className="w-3 h-3" />
            Completed
          </div>
        )}
        
        <button
          onClick={onPlay}
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all"
        >
          <Play className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
        
        {progress && !progress.completed && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${progress.progress_percentage}%` }}
            />
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{video.title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description}</p>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {video.duration}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {video.views_count}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium capitalize">
              {video.language}
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium capitalize">
              {video.difficulty_level}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike();
            }}
            className="flex items-center gap-1 text-gray-600 hover:text-red-500 transition-colors"
          >
            <ThumbsUp className="w-4 h-4" />
            <span className="text-sm">{video.likes_count}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Video Player Modal
const VideoPlayerModal = ({ video, onClose, onUpdateProgress }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    if (!videoError) {
      const interval = setInterval(() => {
        if (currentTime > 0) {
          onUpdateProgress(video.id, Math.floor(currentTime), video.duration_minutes * 60);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [currentTime, videoError]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-900">{video.title}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="aspect-video bg-gray-900 rounded-lg mb-6 flex items-center justify-center overflow-hidden">
            {videoError ? (
              <div className="text-center text-white p-8">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
                <p className="text-lg mb-2">Video not available</p>
                <p className="text-sm opacity-75">The video file could not be loaded</p>
                <p className="text-xs opacity-50 mt-2">Please upload a valid video file or check the URL</p>
              </div>
            ) : (
              <video
                src={video.video_url}
                controls
                autoPlay
                className="w-full h-full rounded-lg"
                onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
                onError={() => setVideoError(true)}
              >
                Your browser does not support video playback.
              </video>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {video.views_count} views
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                {video.average_rating || 0} ({video.total_ratings || 0} ratings)
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs capitalize">
                {video.language}
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs capitalize">
                {video.difficulty_level}
              </span>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{video.description}</p>
            </div>

            {video.topics_covered && video.topics_covered.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Topics Covered</h3>
                <div className="flex flex-wrap gap-2">
                  {video.topics_covered.map((topic, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {video.suitable_for_crops && video.suitable_for_crops.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Suitable for Crops</h3>
                <div className="flex flex-wrap gap-2">
                  {video.suitable_for_crops.map((crop, idx) => (
                    <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Upload Modal
const UploadModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'pest_control',
    duration_minutes: 5,
    language: 'telugu',
    difficulty_level: 'beginner'
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a video file');
      return;
    }

    setUploading(true);
    const formDataObj = new FormData();
    formDataObj.append('file', file);
    Object.keys(formData).forEach(key => {
      formDataObj.append(key, formData[key]);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/video-tutorials/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataObj
      });

      if (response.ok) {
        alert('Video uploaded successfully!');
        onSuccess();
        onClose();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to upload video');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      alert('Error uploading video');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Upload Video Tutorial</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Video File *</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full border border-gray-300 rounded-lg p-2"
              required
            />
            {file && (
              <p className="text-sm text-gray-600 mt-1">Selected: {file.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Enter video title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2"
              rows="3"
              placeholder="Describe what this video teaches"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="pest_control">Pest Control</option>
                <option value="soil_management">Soil Management</option>
                <option value="composting">Composting</option>
                <option value="irrigation">Irrigation</option>
                <option value="seed_treatment">Seed Treatment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (mins)</label>
              <input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value)})}
                className="w-full border border-gray-300 rounded-lg p-2"
                min="1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({...formData, language: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="telugu">Telugu</option>
                <option value="hindi">Hindi</option>
                <option value="english">English</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select
                value={formData.difficulty_level}
                onChange={(e) => setFormData({...formData, difficulty_level: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-2"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Uploading...' : 'Upload Video'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VideoTutorialsPage;