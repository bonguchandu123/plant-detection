import React, { useState, useEffect } from 'react';
import { 
  Camera, Upload, AlertCircle, Check, Star, Phone, Loader, 
  History, Share2, MessageCircle, X, TrendingUp, Activity,
  Image as ImageIcon, Tag, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:8000';

const AnalyzeCropPage = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [cropType, setCropType] = useState('rice');
  const [savedAnalyses, setSavedAnalyses] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const [shareData, setShareData] = useState({ 
    title: '', 
    content: '', 
    tags: [],
    mediaUrls: []
  });
  const [newTag, setNewTag] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const { getToken } = useAuth();

  useEffect(() => {
    loadSavedAnalyses();
  }, []);

  const loadSavedAnalyses = async () => {
    const token = getToken();
    if (!token) return;

    setLoadingHistory(true);
    try {
      const response = await fetch(`${API_BASE}/api/crop-photos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSavedAnalyses(data || []);
      }
    } catch (err) {
      console.error('Failed to load saved analyses:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size should be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
      setSelectedImage(URL.createObjectURL(file));
      setError(null);
      setResult(null);
      setShareSuccess(false);
    }
  };

  const analyzeImage = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    const token = getToken();
    if (!token) {
      setError('Please login first');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('crop_id', '');
      formData.append('location', '');

      const response = await fetch(`${API_BASE}/api/crop-photos/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Analysis failed');
      }

      setResult({
        disease: data.diagnosis?.disease || 'Unknown',
        confidence: data.diagnosis?.confidence || 0,
        severity: 'medium',
        isHealthy: data.diagnosis?.disease?.toLowerCase().includes('healthy'),
        aiGuidance: data.diagnosis?.treatment || '',
        analysisId: data.photo_id,
        imageUrl: data.image_url,
        cropType: cropType
      });

      setShareData({
        title: `Help needed: ${data.diagnosis?.disease || 'Unknown disease'} in ${cropType}`,
        content: `I detected ${data.diagnosis?.disease || 'an issue'} in my ${cropType} crop with ${((data.diagnosis?.confidence || 0) * 100).toFixed(0)}% confidence. Has anyone dealt with this before? Looking for advice and solutions.`,
        tags: [cropType, 'disease-help', data.diagnosis?.disease?.toLowerCase().replace(/\s+/g, '-') || 'unknown'],
        mediaUrls: [data.image_url]
      });

      loadSavedAnalyses();
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleShareToCommunity = async () => {
    if (!result?.analysisId) {
      setError('No analysis to share');
      return;
    }

    const token = getToken();
    if (!token) {
      setError('Please login first');
      return;
    }

    setSharing(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/crop-photos/${result.analysisId}/share-to-community`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: shareData.title,
          content: shareData.content,
          tags: shareData.tags,
          media_urls: shareData.mediaUrls
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to share');
      }

      setShareSuccess(true);
      setTimeout(() => {
        setShareModal(false);
        setShareSuccess(false);
        setNewTag('');
      }, 2000);
    } catch (err) {
      console.error('Share error:', err);
      setError(err.message || 'Failed to share to community');
    } finally {
      setSharing(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !shareData.tags.includes(newTag.trim())) {
      setShareData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim().toLowerCase()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setShareData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const loadSavedAnalysis = async (analysis) => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/api/crop-photos/${analysis.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setResult({
          disease: data.disease || 'Unknown',
          confidence: data.confidence || 0,
          severity: 'medium',
          isHealthy: data.disease?.toLowerCase().includes('healthy'),
          aiGuidance: data.treatment || '',
          analysisId: data.id,
          imageUrl: data.image_url,
          cropType: cropType
        });
        setSelectedImage(data.image_url);
        
        setShareData({
          title: `Help needed: ${data.disease || 'Unknown disease'} in ${cropType}`,
          content: `I detected ${data.disease || 'an issue'} in my ${cropType} crop. Has anyone dealt with this before? Looking for advice.`,
          tags: [cropType, 'disease-help', data.disease?.toLowerCase().replace(/\s+/g, '-') || 'unknown'],
          mediaUrls: [data.image_url]
        });
      }
    } catch (err) {
      console.error('Failed to load analysis:', err);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    setResult(null);
    setError(null);
    setShareSuccess(false);
    setShareData({ title: '', content: '', tags: [], mediaUrls: [] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Crop Disease Analysis</h1>
          <p className="text-gray-600">AI-powered disease detection and expert guidance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Camera className="w-7 h-7 text-green-600" />
                  Analyze Your Crop
                </h2>
                {selectedImage && (
                  <button
                    onClick={resetAnalysis}
                    className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Reset
                  </button>
                )}
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Select Crop Type
                </label>
                <select
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium"
                >
                  <option value="rice">Rice (వరి)</option>
                  <option value="tomato">Tomato (టమాటా)</option>
                  <option value="potato">Potato (బంగాళాదుంప)</option>
                  <option value="cotton">Cotton (పత్తి)</option>
                  <option value="wheat">Wheat (గోధుమ)</option>
                  <option value="millet">Millet (సజ్జలు)</option>
                </select>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-900 font-semibold">Error</p>
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {shareSuccess && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-xl">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-900 font-semibold">Success!</p>
                      <p className="text-green-700 text-sm">Analysis shared to community forum</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="relative">
                {selectedImage ? (
                  <div className="space-y-4">
                    <div className="relative group">
                      <img 
                        src={selectedImage} 
                        alt="Crop" 
                        className="w-full h-96 object-cover rounded-2xl shadow-md"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-2xl"></div>
                    </div>
                  </div>
                ) : (
                  <div className="border-3 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer">
                    <label htmlFor="image-upload" className="cursor-pointer block">
                      <div className="mb-4 flex justify-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                          <ImageIcon className="w-10 h-10 text-green-600" />
                        </div>
                      </div>
                      <p className="text-gray-900 text-lg font-semibold mb-2">Upload or capture crop image</p>
                      <p className="text-gray-500 mb-6">JPG, PNG or JPEG (max 10MB)</p>
                      <div className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl">
                        <Upload className="w-5 h-5" />
                        <span>Choose Image</span>
                      </div>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                  </div>
                )}
              </div>

              {selectedImage && !result && (
                <button
                  onClick={analyzeImage}
                  disabled={analyzing}
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                >
                  {analyzing ? (
                    <>
                      <Loader className="w-6 h-6 animate-spin" />
                      <span>Analyzing with AI...</span>
                    </>
                  ) : (
                    <>
                      <Activity className="w-6 h-6" />
                      <span>Analyze Crop Disease</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {result && (
              <div className="space-y-6">
                <div className={`rounded-2xl shadow-lg p-6 border-l-4 ${
                  result.isHealthy 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500' 
                    : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-500'
                }`}>
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      {result.isHealthy ? (
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-7 h-7 text-white" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                          <AlertCircle className="w-7 h-7 text-white" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {result.isHealthy ? 'Healthy Crop' : 'Disease Detected'}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">AI Analysis Complete</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white bg-opacity-70 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-2 font-medium">Disease/Issue</p>
                      <p className="text-xl font-bold text-gray-900">{result.disease}</p>
                    </div>
                    <div className="bg-white bg-opacity-70 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-2 font-medium">AI Confidence</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500" 
                            style={{width: `${result.confidence * 100}%`}}
                          ></div>
                        </div>
                        <span className="text-xl font-bold text-gray-900">
                          {(result.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

               {result.aiGuidance && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-blue-900">AI Expert Guidance</h4>
                    </div>
                    <div className="bg-white bg-opacity-70 rounded-xl p-4 max-h-80 overflow-y-auto">
                      <div className="text-gray-800 text-sm leading-relaxed space-y-3">
                        {result.aiGuidance.split('\n').map((line, idx) => {
                          // Handle bold text with **
                          const boldRegex = /\*\*(.*?)\*\*/g;
                          const hasBold = boldRegex.test(line);
                          
                          if (hasBold) {
                            const parts = line.split(/(\*\*.*?\*\*)/g);
                            return (
                              <div key={idx} className="leading-relaxed">
                                {parts.map((part, partIdx) => {
                                  if (part.startsWith('**') && part.endsWith('**')) {
                                    return (
                                      <strong key={partIdx} className="font-bold text-blue-900">
                                        {part.slice(2, -2)}
                                      </strong>
                                    );
                                  }
                                  return <span key={partIdx}>{part}</span>;
                                })}
                              </div>
                            );
                          }
                          
                          // Handle bullet points
                          if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
                            return (
                              <div key={idx} className="flex gap-2 ml-2">
                                <span className="text-blue-600 font-bold">•</span>
                                <span>{line.replace(/^[•\-*]\s*/, '')}</span>
                              </div>
                            );
                          }
                          
                          // Handle numbered lists
                          if (/^\d+\./.test(line.trim())) {
                            return (
                              <div key={idx} className="flex gap-2 ml-2">
                                <span className="text-blue-600 font-bold">{line.match(/^\d+\./)[0]}</span>
                                <span>{line.replace(/^\d+\.\s*/, '')}</span>
                              </div>
                            );
                          }
                          
                          // Handle section headers (lines that end with :)
                          if (line.trim().endsWith(':') && line.trim().length > 3) {
                            return (
                              <div key={idx} className="font-bold text-blue-900 mt-3 mb-1">
                                {line}
                              </div>
                            );
                          }
                          
                          // Regular text
                          if (line.trim()) {
                            return <div key={idx}>{line}</div>;
                          }
                          
                          return <div key={idx} className="h-2"></div>;
                        })}
                      </div>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={resetAnalysis}
                    className="py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all border-2 border-gray-200 hover:border-gray-300"
                  >
                    Analyze Another
                  </button>
                  <button
                    onClick={() => setShareModal(true)}
                    className="py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Share to Community</span>
                  </button>
                  <button
                    className="py-3 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Consult Expert</span>
                  </button>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg">
              <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2 text-lg">
                <TrendingUp className="w-6 h-6" />
                <span>Tips for Better Results</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Take clear photos in natural daylight',
                  'Focus on the affected area of the plant',
                  'Capture close-up images for detail',
                  'Avoid blurry or dark images'
                ].map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white bg-opacity-70 rounded-xl p-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-blue-900 text-sm font-medium">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <History className="w-6 h-6 text-purple-600" />
                  <span>Recent Analyses</span>
                </h3>
                <button
                  onClick={loadSavedAnalyses}
                  disabled={loadingHistory}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {loadingHistory ? 'Loading...' : 'Refresh'}
                </button>
              </div>

              {loadingHistory ? (
                <div className="flex justify-center py-12">
                  <Loader className="w-8 h-8 animate-spin text-purple-600" />
                </div>
              ) : savedAnalyses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <History className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium">No analyses yet</p>
                  <p className="text-gray-400 text-sm mt-1">Upload an image to get started</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {savedAnalyses.map((analysis) => (
                    <div
                      key={analysis.id}
                      className="p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl hover:from-blue-50 hover:to-purple-50 transition-all cursor-pointer border-2 border-transparent hover:border-blue-300 group"
                      onClick={() => loadSavedAnalysis(analysis)}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={analysis.image_url}
                          alt="Crop"
                          className="w-20 h-20 rounded-lg object-cover shadow-md group-hover:shadow-lg transition-shadow"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate mb-1">
                            {analysis.disease || 'Analysis'}
                          </p>
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full"
                                style={{width: `${(analysis.confidence * 100)}%`}}
                              ></div>
                            </div>
                            <span className="text-xs font-semibold text-gray-700">
                              {(analysis.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(analysis.uploaded_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {shareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Share2 className="w-6 h-6 text-white" />
                  </div>
                  Share to Community
                </h2>
                <button
                  onClick={() => setShareModal(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  Post Title
                </label>
                <input
                  type="text"
                  value={shareData.title}
                  onChange={(e) => setShareData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                  placeholder="Give your post a descriptive title"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-gray-500" />
                  Description
                </label>
                <textarea
                  value={shareData.content}
                  onChange={(e) => setShareData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                  rows="6"
                  placeholder="Describe your issue and what help you need..."
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-500" />
                  Tags
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Add a tag and press Enter"
                  />
                  <button
                    onClick={addTag}
                    className="px-6 py-2 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {shareData.tags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 border-2 border-blue-200"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-blue-900 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {result && (
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-5 border-2 border-gray-200">
                  <p className="text-sm font-bold text-gray-700 mb-3">Analysis Preview:</p>
                  <div className="flex gap-4 bg-white rounded-lg p-3 shadow-sm">
                    <img 
                      src={result.imageUrl} 
                      alt="Analysis" 
                      className="w-24 h-24 rounded-lg object-cover shadow-md border-2 border-gray-200"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900 mb-1">{result.disease}</p>
                      <p className="text-xs text-gray-600 mb-2">
                        Confidence: {(result.confidence * 100).toFixed(0)}%
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                            style={{width: `${result.confidence * 100}%`}}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShareModal(false);
                    setNewTag('');
                  }}
                  disabled={sharing}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleShareToCommunity}
                  disabled={sharing || !shareData.title || !shareData.content}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  {sharing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Sharing...</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-5 h-5" />
                      <span>Share to Forum</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyzeCropPage;