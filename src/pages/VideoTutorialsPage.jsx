import React, { useState, useEffect } from 'react';
import { Video, Play, Clock, Eye, ThumbsUp, Star, Upload, Search, X, CheckCircle, AlertCircle, FileVideo, Info, Youtube, Link as LinkIcon, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:8000/api';

// Translation object
const translations = {
  en: {
    pageTitle: "Video Tutorials",
    pageSubtitle: "Learn organic farming techniques",
    seedData: "Seed Data",
    addVideo: "Add Video",
    yourProgress: "Your Learning Progress",
    videosCompleted: "videos completed",
    videosStarted: "Videos Started",
    searchVideos: "Search videos...",
    allCategories: "All Categories",
    allLanguages: "All Languages",
    allLevels: "All Levels",
    noVideosFound: "No videos found",
    noVideosDesc: "Try adjusting your filters or add sample videos",
    addSampleVideos: "Add Sample Videos",
    completed: "Completed",
    featured: "FEATURED",
    views: "views",
    ratings: "ratings",
    description: "Description",
    topicsCovered: "Topics Covered",
    suitableForCrops: "Suitable for Crops",
    watchVideo: "Watch Video",
    viewFullDesc: "View full description",
    uploadVideo: "Upload Video",
    youtubeUrl: "YouTube URL",
    videoFile: "Video File",
    maxSize: "Max 100MB",
    chooseFile: "Choose video file",
    dragDrop: "or drag and drop",
    fileFormats: "MP4, AVI, MOV up to 100MB",
    pasteUrl: "Paste the full YouTube video URL",
    title: "Title",
    enterTitle: "Enter video title",
    describeVideo: "Describe what this video teaches",
    category: "Category",
    duration: "Duration (mins)",
    language: "Language",
    difficulty: "Difficulty",
    uploading: "Uploading...",
    adding: "Adding...",
    uploadVideoBtn: "Upload Video",
    addYoutubeBtn: "Add YouTube Video",
    progress: "Progress",
    almostDone: "Almost done!",
    keepWatching: "Keep watching to complete",
    categories: {
      pest_control: "Pest Control",
      soil_management: "Soil Management",
      composting: "Composting",
      irrigation: "Irrigation",
      seed_treatment: "Seed Treatment"
    },
    languages: {
      telugu: "Telugu",
      hindi: "Hindi",
      english: "English"
    },
    levels: {
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced"
    },
    errors: {
      selectVideo: "Please select a video file",
      enterUrl: "Please enter a YouTube URL",
      invalidFile: "Please select a valid video file (mp4, avi, mov, etc.)",
      fileTooLarge: "File too large ({size}MB). Maximum size is 100MB",
      uploadFailed: "Failed to add video",
      networkError: "Network error during upload"
    }
  },
  te: {
    pageTitle: "వీడియో ట్యుటోరియల్స్",
    pageSubtitle: "సేంద్రీయ వ్యవసాయ పద్ధతులను నేర్చుకోండి",
    seedData: "నమూనా డేటా",
    addVideo: "వీడియో జోడించండి",
    yourProgress: "మీ అభ్యాస పురోగతి",
    videosCompleted: "వీడియోలు పూర్తయ్యాయి",
    videosStarted: "ప్రారంభించిన వీడియోలు",
    searchVideos: "వీడియోలను వెతకండి...",
    allCategories: "అన్ని వర్గాలు",
    allLanguages: "అన్ని భాషలు",
    allLevels: "అన్ని స్థాయిలు",
    noVideosFound: "వీడియోలు కనుగొనబడలేదు",
    noVideosDesc: "మీ ఫిల్టర్‌లను సర్దుబాటు చేయండి లేదా నమూనా వీడియోలను జోడించండి",
    addSampleVideos: "నమూనా వీడియోలను జోడించండి",
    completed: "పూర్తయింది",
    featured: "ప్రత్యేకమైనది",
    views: "వీక్షణలు",
    ratings: "రేటింగ్‌లు",
    description: "వివరణ",
    topicsCovered: "కవర్ చేసిన అంశాలు",
    suitableForCrops: "తగిన పంటలు",
    watchVideo: "వీడియో చూడండి",
    viewFullDesc: "పూర్తి వివరణ చూడండి",
    uploadVideo: "వీడియో అప్‌లోడ్ చేయండి",
    youtubeUrl: "YouTube URL",
    videoFile: "వీడియో ఫైల్",
    maxSize: "గరిష్టం 100MB",
    chooseFile: "వీడియో ఫైల్ ఎంచుకోండి",
    dragDrop: "లేదా డ్రాగ్ మరియు డ్రాప్ చేయండి",
    fileFormats: "MP4, AVI, MOV 100MB వరకు",
    pasteUrl: "పూర్తి YouTube వీడియో URL ను పేస్ట్ చేయండి",
    title: "శీర్షిక",
    enterTitle: "వీడియో శీర్షికను నమోదు చేయండి",
    describeVideo: "ఈ వీడియో ఏమి నేర్పుతుందో వివరించండి",
    category: "వర్గం",
    duration: "వ్యవధి (నిమిషాలు)",
    language: "భాష",
    difficulty: "కష్టం స్థాయి",
    uploading: "అప్‌లోడ్ అవుతోంది...",
    adding: "జోడిస్తోంది...",
    uploadVideoBtn: "వీడియో అప్‌లోడ్ చేయండి",
    addYoutubeBtn: "YouTube వీడియో జోడించండి",
    progress: "పురోగతి",
    almostDone: "దాదాపు పూర్తయింది!",
    keepWatching: "పూర్తి చేయడానికి చూస్తూ ఉండండి",
    categories: {
      pest_control: "చీడపీడల నియంత్రణ",
      soil_management: "నేల నిర్వహణ",
      composting: "కంపోస్టింగ్",
      irrigation: "నీటిపారుదల",
      seed_treatment: "విత్తన చికిత్స"
    },
    languages: {
      telugu: "తెలుగు",
      hindi: "హిందీ",
      english: "ఇంగ్లీష్"
    },
    levels: {
      beginner: "ప్రారంభ స్థాయి",
      intermediate: "మధ్యస్థ స్థాయి",
      advanced: "అధునాతన స్థాయి"
    },
    errors: {
      selectVideo: "దయచేసి వీడియో ఫైల్‌ను ఎంచుకోండి",
      enterUrl: "దయచేసి YouTube URLను నమోదు చేయండి",
      invalidFile: "దయచేసి చెల్లుబాటు అయ్యే వీడియో ఫైల్‌ను ఎంచుకోండి (mp4, avi, mov, మొదలైనవి)",
      fileTooLarge: "ఫైల్ చాలా పెద్దది ({size}MB). గరిష్ట పరిమాణం 100MB",
      uploadFailed: "వీడియో జోడించడం విఫలమైంది",
      networkError: "అప్‌లోడ్ సమయంలో నెట్‌వర్క్ లోపం"
    }
  }
};

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
  const [appLanguage, setAppLanguage] = useState('en'); 
  const {getToken} = useAuth()// App language state

  const token = getToken()
  const t = translations[appLanguage];

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
      const response = await fetch(`${API_BASE_URL}/video-tutorials/${videoId}/progress`, {
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
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.completed) {
          alert('Video completed! Your learning progress has been updated.');
        }
        
        fetchUserProgress();
        fetchVideos();
      }
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
        {/* Header with Language Toggle */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t.pageTitle}</h1>
            <p className="text-gray-600 mt-1">{t.pageSubtitle}</p>
          </div>
          <div className="flex gap-3 items-center">
            {/* Language Toggle */}
            <div className="flex gap-1 bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setAppLanguage('en')}
                className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                  appLanguage === 'en'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Globe className="w-4 h-4" />
                EN
              </button>
              <button
                onClick={() => setAppLanguage('te')}
                className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                  appLanguage === 'te'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Globe className="w-4 h-4" />
                తె
              </button>
            </div>
            {/* <button
              onClick={handleSeedVideos}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Video className="w-5 h-5" />
              {t.seedData}
            </button> */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              {t.addVideo}
            </button>
          </div>
        </div>

        {/* User Progress Summary */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">{t.yourProgress}</h3>
              <p className="text-green-100">
                {Object.values(userProgress).filter(p => p.completed).length} {t.videosCompleted}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {Object.keys(userProgress).length}
              </div>
              <div className="text-green-100 text-sm">{t.videosStarted}</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={t.searchVideos}
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">{t.allCategories}</option>
              {categories.map(cat => (
                <option key={cat.category} value={cat.category}>
                  {t.categories[cat.category] || cat.category} ({cat.count})
                </option>
              ))}
            </select>

            <select
              value={filters.language}
              onChange={(e) => setFilters({...filters, language: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">{t.allLanguages}</option>
              <option value="telugu">{t.languages.telugu}</option>
              <option value="hindi">{t.languages.hindi}</option>
              <option value="english">{t.languages.english}</option>
            </select>

            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">{t.allLevels}</option>
              <option value="beginner">{t.levels.beginner}</option>
              <option value="intermediate">{t.levels.intermediate}</option>
              <option value="advanced">{t.levels.advanced}</option>
            </select>
          </div>
        </div>

        {/* Video Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">{t.uploading}</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Video size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.noVideosFound}</h3>
            <p className="text-gray-600 mb-4">{t.noVideosDesc}</p>
            <button
              onClick={handleSeedVideos}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              {t.addSampleVideos}
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
                translations={t}
              />
            ))}
          </div>
        )}

        {/* Video Player Modal */}
        {selectedVideo && (
          <VideoPlayerModal
            video={selectedVideo}
            progress={userProgress[selectedVideo.id]}
            onClose={() => {
              setSelectedVideo(null);
              fetchUserProgress();
            }}
            onUpdateProgress={updateProgress}
            translations={t}
          />
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <UploadModal 
            onClose={() => setShowUploadModal(false)} 
            onSuccess={fetchVideos}
            translations={t}
          />
        )}
      </div>
    </div>
  );
};

// Video Card Component
const VideoCard = ({ video, progress, onPlay, onLike, translations: t }) => {
  const [showDescription, setShowDescription] = useState(false);
  const isYouTube = video.video_source === 'youtube';
  
  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all">
        <div className="relative h-48 bg-gradient-to-br from-green-400 to-emerald-600 cursor-pointer group">
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
          
          {isYouTube && (
            <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded flex items-center gap-1 text-xs font-bold">
              <Youtube className="w-3 h-3" />
              YouTube
            </div>
          )}
          
          {video.is_featured && (
            <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-bold">
              {t.featured}
            </div>
          )}
          
          {progress && progress.completed && (
            <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs">
              <CheckCircle className="w-3 h-3" />
              {t.completed}
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
                {t.languages[video.language] || video.language}
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium capitalize">
                {t.levels[video.difficulty_level] || video.difficulty_level}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDescription(true);
                }}
                className="text-gray-600 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-50"
                title={t.viewFullDesc}
              >
                <Info className="w-5 h-5" />
              </button>
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
      </div>
      
      {showDescription && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" 
          onClick={() => setShowDescription(false)}
        >
          <div 
            className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900 pr-4">{video.title}</h3>
              <button 
                onClick={() => setShowDescription(false)} 
                className="text-gray-500 hover:text-gray-700 flex-shrink-0"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">{t.description}</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{video.description}</p>
            </div>
            
            <div className="flex gap-2 flex-wrap mb-4">
              {isYouTube && (
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm flex items-center gap-1">
                  <Youtube className="w-3 h-3" />
                  YouTube
                </span>
              )}
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm capitalize">
                {t.languages[video.language] || video.language}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm capitalize">
                {t.levels[video.difficulty_level] || video.difficulty_level}
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm capitalize">
                {t.categories[video.category] || video.category}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {video.duration}
              </span>
            </div>
            
            <button
              onClick={() => {
                setShowDescription(false);
                onPlay();
              }}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2 transition-colors"
            >
              <Play className="w-5 h-5" />
              {t.watchVideo}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// Video Player Modal Component
const VideoPlayerModal = ({ video, progress, onClose, onUpdateProgress, translations: t }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [hasNotifiedCompletion, setHasNotifiedCompletion] = useState(false);

  const isYouTube = video.video_source === 'youtube';

  useEffect(() => {
    if (!isYouTube && !videoError && duration > 0 && currentTime > 0) {
      const interval = setInterval(() => {
        onUpdateProgress(video.id, Math.floor(currentTime), Math.floor(duration));
        
        const progressPercentage = (currentTime / duration) * 100;
        if (progressPercentage >= 90 && !hasNotifiedCompletion) {
          setHasNotifiedCompletion(true);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [currentTime, duration, videoError, hasNotifiedCompletion, isYouTube]);

  const handleVideoLoaded = (e) => {
    setDuration(e.target.duration);
  };

  const handleTimeUpdate = (e) => {
    setCurrentTime(e.target.currentTime);
  };

  const handleVideoEnd = () => {
    onUpdateProgress(video.id, Math.floor(duration), Math.floor(duration));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">{video.title}</h2>
              {isYouTube && (
                <span className="bg-red-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  <Youtube className="w-3 h-3" />
                  YouTube
                </span>
              )}
            </div>
            {progress && progress.completed && (
              <div className="flex items-center gap-2 text-green-600 text-sm mt-1">
                <CheckCircle className="w-4 h-4" />
                <span>{t.completed}</span>
              </div>
            )}
          </div>
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
              </div>
            ) : (
              <video
                src={video.video_url}
                controls
                autoPlay
                className="w-full h-full rounded-lg"
                onLoadedMetadata={handleVideoLoaded}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnd}
                onError={() => setVideoError(true)}
              >
                Your browser does not support video playback.
              </video>
            )}
          </div>

          {progress && !progress.completed && duration > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>{t.progress}: {Math.round((currentTime / duration) * 100)}%</span>
                <span>{(currentTime / duration) * 100 >= 90 ? t.almostDone : t.keepWatching}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {video.views_count} {t.views}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                {video.average_rating || 0} ({video.total_ratings || 0} {t.ratings})
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs capitalize">
                {t.languages[video.language] || video.language}
              </span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs capitalize">
                {t.levels[video.difficulty_level] || video.difficulty_level}
              </span>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">{t.description}</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{video.description}</p>
            </div>

            {video.topics_covered && video.topics_covered.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-2">{t.topicsCovered}</h3>
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
                <h3 className="font-bold text-gray-900 mb-2">{t.suitableForCrops}</h3>
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

// Upload Modal Component
const UploadModal = ({ onClose, onSuccess, translations: t }) => {
  const [uploadType, setUploadType] = useState('file');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'pest_control',
    duration_minutes: 5,
    language: 'telugu',
    difficulty_level: 'beginner',
    youtube_url: ''
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const {getToken} = useAuth()
  const token = getToken()

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) return;
    
    if (!selectedFile.type.startsWith('video/')) {
      setError(t.errors.invalidFile);
      setFile(null);
      return;
    }
    
    const fileSizeMB = selectedFile.size / (1024 * 1024);
    if (fileSizeMB > 100) {
      setError(t.errors.fileTooLarge.replace('{size}', fileSizeMB.toFixed(1)));
      setFile(null);
      return;
    }
    
    setError('');
    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (uploadType === 'file' && !file) {
      setError(t.errors.selectVideo);
      return;
    }

    if (uploadType === 'youtube' && !formData.youtube_url) {
      setError(t.errors.enterUrl);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    const formDataObj = new FormData();
    
    if (uploadType === 'file') {
      formDataObj.append('file', file);
    } else {
      formDataObj.append('youtube_url', formData.youtube_url);
    }
    
    formDataObj.append('title', formData.title);
    formDataObj.append('description', formData.description);
    formDataObj.append('category', formData.category);
    formDataObj.append('duration_minutes', formData.duration_minutes.toString());
    formDataObj.append('language', formData.language);
    formDataObj.append('difficulty_level', formData.difficulty_level);

    try {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(Math.round(percentComplete));
        }
      });
      
      xhr.addEventListener('load', async () => {
        if (xhr.status === 200) {
          alert('Video added successfully!');
          onSuccess();
          onClose();
        } else {
          const error = JSON.parse(xhr.responseText);
          setError(error.detail || t.errors.uploadFailed);
        }
        setUploading(false);
      });
      
      xhr.addEventListener('error', () => {
        setError(t.errors.networkError);
        setUploading(false);
      });
      
      xhr.open('POST', `${API_BASE_URL}/video-tutorials/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formDataObj);
      
    } catch (error) {
      console.error('Error adding video:', error);
      setError(t.errors.uploadFailed + ': ' + error.message);
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">{t.addVideo}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" disabled={uploading}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => setUploadType('file')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
                uploadType === 'file'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              disabled={uploading}
            >
              <FileVideo className="w-4 h-4" />
              {t.uploadVideo}
            </button>
            <button
              type="button"
              onClick={() => setUploadType('youtube')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
                uploadType === 'youtube'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              disabled={uploading}
            >
              <Youtube className="w-4 h-4" />
              {t.youtubeUrl}
            </button>
          </div>
          
          {uploadType === 'file' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.videoFile} * ({t.maxSize})
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                <FileVideo className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="video-upload"
                  disabled={uploading}
                />
                <label htmlFor="video-upload" className="cursor-pointer">
                  <span className="text-green-600 hover:text-green-700 font-medium">
                    {t.chooseFile}
                  </span>
                  <span className="text-gray-500 text-sm ml-2">
                    {t.dragDrop}
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">{t.fileFormats}</p>
              </div>
              {file && (
                <div className="mt-2 p-3 bg-green-50 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-600">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.youtubeUrl} *
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  value={formData.youtube_url}
                  onChange={(e) => setFormData({...formData, youtube_url: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="https://www.youtube.com/watch?v=..."
                  disabled={uploading}
                  required={uploadType === 'youtube'}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{t.pasteUrl}</p>
            </div>
          )}

          {uploading && uploadType === 'file' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{t.uploading}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.title} *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder={t.enterTitle}
              required
              disabled={uploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.description} *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows="3"
              placeholder={t.describeVideo}
              required
              disabled={uploading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.category}</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={uploading}
              >
                <option value="pest_control">{t.categories.pest_control}</option>
                <option value="soil_management">{t.categories.soil_management}</option>
                <option value="composting">{t.categories.composting}</option>
                <option value="irrigation">{t.categories.irrigation}</option>
                <option value="seed_treatment">{t.categories.seed_treatment}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.duration}</label>
              <input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value)})}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min="1"
                required
                disabled={uploading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.language}</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({...formData, language: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={uploading}
              >
                <option value="telugu">{t.languages.telugu}</option>
                <option value="hindi">{t.languages.hindi}</option>
                <option value="english">{t.languages.english}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.difficulty}</label>
              <select
                value={formData.difficulty_level}
                onChange={(e) => setFormData({...formData, difficulty_level: e.target.value})}
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={uploading}
              >
                <option value="beginner">{t.levels.beginner}</option>
                <option value="intermediate">{t.levels.intermediate}</option>
                <option value="advanced">{t.levels.advanced}</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading || (uploadType === 'file' && !file) || (uploadType === 'youtube' && !formData.youtube_url)}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                {uploadType === 'file' ? `${t.uploading} ${uploadProgress}%` : t.adding}
              </>
            ) : (
              <>
                {uploadType === 'file' ? <Upload className="w-5 h-5" /> : <Youtube className="w-5 h-5" />}
                {uploadType === 'file' ? t.uploadVideoBtn : t.addYoutubeBtn}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VideoTutorialsPage;