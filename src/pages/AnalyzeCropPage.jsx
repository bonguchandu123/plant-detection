import React, { useState, useEffect } from 'react';
import { 
  Camera, Upload, AlertCircle, Check, Star, Phone, Loader, 
  History, Share2, MessageCircle, X, TrendingUp, Activity,
  Image as ImageIcon, Tag, FileText, Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:8000';

// Telugu translations
const translations = {
  english: {
    title: "Crop Disease Analysis",
    subtitle: "AI-powered disease detection and expert guidance",
    analyzeYourCrop: "Analyze Your Crop",
    selectCropType: "Select Crop Type",
    uploadOrCapture: "Upload or capture crop image",
    chooseImage: "Choose Image",
    analyzing: "Analyzing with AI...",
    analyzeCropDisease: "Analyze Crop Disease",
    analyzeAnother: "Analyze Another",
    shareToCommunity: "Share to Community",
    consultExpert: "Consult Expert",
    diseaseDetected: "Disease Detected",
    healthyCrop: "Healthy Crop",
    aiAnalysisComplete: "AI Analysis Complete",
    diseaseIssue: "Disease/Issue",
    aiConfidence: "AI Confidence",
    aiExpertGuidance: "AI Expert Guidance",
    tipsForBetterResults: "Tips for Better Results",
    recentAnalyses: "Recent Analyses",
    noAnalysesYet: "No analyses yet",
    uploadToStart: "Upload an image to get started",
    shareToCommunityTitle: "Share to Community",
    postTitle: "Post Title",
    description: "Description",
    tags: "Tags",
    addTag: "Add a tag and press Enter",
    add: "Add",
    analysisPreview: "Analysis Preview",
    cancel: "Cancel",
    shareToForum: "Share to Forum",
    sharing: "Sharing...",
    success: "Success!",
    sharedToForum: "Analysis shared to community forum",
    error: "Error",
    reset: "Reset",
    refresh: "Refresh",
    loading: "Loading...",
    tips: [
      'Take clear photos in natural daylight',
      'Focus on the affected area of the plant',
      'Capture close-up images for detail',
      'Avoid blurry or dark images'
    ],
    crops: {
      rice: "Rice (వరి)",
      tomato: "Tomato (టమాటా)",
      potato: "Potato (బంగాళాదుంప)",
      cotton: "Cotton (పత్తి)",
      wheat: "Wheat (గోధుమ)",
      millet: "Millet (సజ్జలు)"
    }
  },
  telugu: {
    title: "పంట వ్యాధి విశ్లేషణ",
    subtitle: "AI-శక్తితో వ్యాధి గుర్తింపు మరియు నిపుణుల మార్గదర్శకత్వం",
    analyzeYourCrop: "మీ పంటను విశ్లేషించండి",
    selectCropType: "పంట రకాన్ని ఎంచుకోండి",
    uploadOrCapture: "పంట చిత్రాన్ని అప్‌లోడ్ లేదా క్యాప్చర్ చేయండి",
    chooseImage: "చిత్రాన్ని ఎంచుకోండి",
    analyzing: "AI తో విశ్లేషిస్తోంది...",
    analyzeCropDisease: "పంట వ్యాధిని విశ్లేషించండి",
    analyzeAnother: "మరొకటి విశ్లేషించండి",
    shareToCommunity: "సంఘంతో పంచుకోండి",
    consultExpert: "నిపుణుడిని సంప్రదించండి",
    diseaseDetected: "వ్యాధి కనుగొనబడింది",
    healthyCrop: "ఆరోగ్యకరమైన పంట",
    aiAnalysisComplete: "AI విశ్లేషణ పూర్తయింది",
    diseaseIssue: "వ్యాధి/సమస్య",
    aiConfidence: "AI విశ్వాసం",
    aiExpertGuidance: "AI నిపుణుల మార్గదర్శకత్వం",
    tipsForBetterResults: "మెరుగైన ఫలితాల కోసం చిట్కాలు",
    recentAnalyses: "ఇటీవలి విశ్లేషణలు",
    noAnalysesYet: "ఇంకా విశ్లేషణలు లేవు",
    uploadToStart: "ప్రారంభించడానికి చిత్రాన్ని అప్‌లోడ్ చేయండి",
    shareToCommunityTitle: "సంఘంతో పంచుకోండి",
    postTitle: "పోస్ట్ శీర్షిక",
    description: "వివరణ",
    tags: "ట్యాగ్‌లు",
    addTag: "ట్యాగ్ జోడించి Enter నొక్కండి",
    add: "జోడించు",
    analysisPreview: "విశ్లేషణ ప్రివ్యూ",
    cancel: "రద్దు చేయి",
    shareToForum: "ఫోరమ్‌కు పంచుకోండి",
    sharing: "పంచుకుంటోంది...",
    success: "విజయం!",
    sharedToForum: "విశ్లేషణ సంఘ ఫోరమ్‌కు పంచుకోబడింది",
    error: "లోపం",
    reset: "రీసెట్",
    refresh: "రిఫ్రెష్",
    loading: "లోడ్ అవుతోంది...",
    tips: [
      'సహజ పగటి వెలుతురులో స్పష్టమైన ఫోటోలు తీయండి',
      'మొక్క యొక్క ప్రభావిత ప్రాంతంపై దృష్టి పెట్టండి',
      'వివరాల కోసం క్లోజ్-అప్ చిత్రాలను క్యాప్చర్ చేయండి',
      'అస్పష్టమైన లేదా చీకటి చిత్రాలను నివారించండి'
    ],
    crops: {
      rice: "వరి",
      tomato: "టమాటా",
      potato: "బంగాళాదుంప",
      cotton: "పత్తి",
      wheat: "గోధుమ",
      millet: "సజ్జలు"
    }
  }
};

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
  const [language, setLanguage] = useState('telugu'); // Default to Telugu
  const { getToken, user } = useAuth();

  const t = translations[language];

  useEffect(() => {
    loadSavedAnalyses();
    // Load user's language preference
    if (user?.language_preference) {
      setLanguage(user.language_preference === 'telugu' ? 'telugu' : 'english');
    }
  }, [user]);

  const toggleLanguage = () => {
    const newLang = language === 'english' ? 'telugu' : 'english';
    setLanguage(newLang);
    
    // Update user preference in backend
    const token = getToken();
    if (token) {
      fetch(`${API_BASE}/api/users/language`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ language: newLang })
      }).catch(err => console.error('Failed to update language:', err));
    }
  };

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
        setError(language === 'telugu' ? 'దయచేసి చిత్ర ఫైల్‌ను ఎంచుకోండి' : 'Please select an image file');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setError(language === 'telugu' ? 'చిత్ర పరిమాణం 10MB కంటే తక్కువగా ఉండాలి' : 'Image size should be less than 10MB');
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
      setError(language === 'telugu' ? 'దయచేసి ముందుగా చిత్రాన్ని ఎంచుకోండి' : 'Please select an image first');
      return;
    }

    const token = getToken();
    if (!token) {
      setError(language === 'telugu' ? 'దయచేసి ముందుగా లాగిన్ అవ్వండి' : 'Please login first');
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
        throw new Error(data.detail || (language === 'telugu' ? 'విశ్లేషణ విफల' : 'Analysis failed'));
      }

      setResult({
        disease: data.diagnosis?.disease || (language === 'telugu' ? 'తెలియని' : 'Unknown'),
        confidence: data.diagnosis?.confidence || 0,
        severity: 'medium',
        isHealthy: data.diagnosis?.disease?.toLowerCase().includes('healthy'),
        aiGuidance: data.diagnosis?.treatment || '',
        analysisId: data.photo_id,
        imageUrl: data.image_url,
        cropType: cropType
      });

      const cropName = t.crops[cropType] || cropType;
      setShareData({
        title: language === 'telugu' 
          ? `సహాయం కావాలి: ${cropName}లో ${data.diagnosis?.disease || 'తెలియని వ్యాధి'}`
          : `Help needed: ${data.diagnosis?.disease || 'Unknown disease'} in ${cropType}`,
        content: language === 'telugu'
          ? `నా ${cropName} పంటలో ${data.diagnosis?.disease || 'ఒక సమస్య'} కనుగొన్నాను, ${((data.diagnosis?.confidence || 0) * 100).toFixed(0)}% విశ్వాసంతో. ఎవరైనా ఇంతకు ముందు దీనిని ఎదుర్కొన్నారా? సలహా మరియు పరిష్కారాల కోసం చూస్తున్నాను.`
          : `I detected ${data.diagnosis?.disease || 'an issue'} in my ${cropType} crop with ${((data.diagnosis?.confidence || 0) * 100).toFixed(0)}% confidence. Has anyone dealt with this before? Looking for advice and solutions.`,
        tags: [cropType, language === 'telugu' ? 'వ్యాధి-సహాయం' : 'disease-help', data.diagnosis?.disease?.toLowerCase().replace(/\s+/g, '-') || 'unknown'],
        mediaUrls: [data.image_url]
      });

      loadSavedAnalyses();
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || (language === 'telugu' ? 'చిత్రాన్ని విశ్లేషించడంలో విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.' : 'Failed to analyze image. Please try again.'));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleShareToCommunity = async () => {
    if (!result?.analysisId) {
      setError(language === 'telugu' ? 'పంచుకోవడానికి విశ్లేషణ లేదు' : 'No analysis to share');
      return;
    }

    const token = getToken();
    if (!token) {
      setError(language === 'telugu' ? 'దయచేసి ముందుగా లాగిన్ అవ్వండి' : 'Please login first');
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
        throw new Error(data.detail || (language === 'telugu' ? 'పంచుకోవడం విఫలమైంది' : 'Failed to share'));
      }

      setShareSuccess(true);
      setTimeout(() => {
        setShareModal(false);
        setShareSuccess(false);
        setNewTag('');
      }, 2000);
    } catch (err) {
      console.error('Share error:', err);
      setError(err.message || (language === 'telugu' ? 'సంఘంతో పంచుకోవడం విఫలమైంది' : 'Failed to share to community'));
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
          disease: data.disease || (language === 'telugu' ? 'తెలియని' : 'Unknown'),
          confidence: data.confidence || 0,
          severity: 'medium',
          isHealthy: data.disease?.toLowerCase().includes('healthy'),
          aiGuidance: data.treatment || '',
          analysisId: data.id,
          imageUrl: data.image_url,
          cropType: cropType
        });
        setSelectedImage(data.image_url);
        
        const cropName = t.crops[cropType] || cropType;
        setShareData({
          title: language === 'telugu'
            ? `సహాయం కావాలి: ${cropName}లో ${data.disease || 'తెలియని వ్యాధి'}`
            : `Help needed: ${data.disease || 'Unknown disease'} in ${cropType}`,
          content: language === 'telugu'
            ? `నా ${cropName} పంటలో ${data.disease || 'ఒక సమస్య'} కనుగొన్నాను. ఎవరైనా ఇంతకు ముందు దీనిని ఎదుర్కొన్నారా? సలహా కోసం చూస్తున్నాను.`
            : `I detected ${data.disease || 'an issue'} in my ${cropType} crop. Has anyone dealt with this before? Looking for advice.`,
          tags: [cropType, language === 'telugu' ? 'వ్యాధి-సహాయం' : 'disease-help', data.disease?.toLowerCase().replace(/\s+/g, '-') || 'unknown'],
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
        {/* Language Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-blue-200"
          >
            <Globe className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-700">
              {language === 'english' ? 'తెలుగు' : 'English'}
            </span>
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t.title}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Camera className="w-7 h-7 text-green-600" />
                  {t.analyzeYourCrop}
                </h2>
                {selectedImage && (
                  <button
                    onClick={resetAnalysis}
                    className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                  >
                    {t.reset}
                  </button>
                )}
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {t.selectCropType}
                </label>
                <select
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium"
                >
                  {Object.entries(t.crops).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-900 font-semibold">{t.error}</p>
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
                      <p className="text-green-900 font-semibold">{t.success}</p>
                      <p className="text-green-700 text-sm">{t.sharedToForum}</p>
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
                      <p className="text-gray-900 text-lg font-semibold mb-2">{t.uploadOrCapture}</p>
                      <p className="text-gray-500 mb-6">JPG, PNG {language === 'telugu' ? 'లేదా' : 'or'} JPEG ({language === 'telugu' ? 'గరిష్టం' : 'max'} 10MB)</p>
                      <div className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl">
                        <Upload className="w-5 h-5" />
                        <span>{t.chooseImage}</span>
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
                      <span>{t.analyzing}</span>
                    </>
                  ) : (
                    <>
                      <Activity className="w-6 h-6" />
                      <span>{t.analyzeCropDisease}</span>
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
                          {result.isHealthy ? t.healthyCrop : t.diseaseDetected}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">{t.aiAnalysisComplete}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white bg-opacity-70 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-2 font-medium">{t.diseaseIssue}</p>
                      <p className="text-xl font-bold text-gray-900">{result.disease}</p>
                    </div>
                    <div className="bg-white bg-opacity-70 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-2 font-medium">{t.aiConfidence}</p>
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
                      <h4 className="text-xl font-bold text-blue-900">{t.aiExpertGuidance}</h4>
                    </div>
                    <div className="bg-white bg-opacity-70 rounded-xl p-4 max-h-80 overflow-y-auto">
                      <div className="text-gray-800 text-sm leading-relaxed space-y-3">
                        {result.aiGuidance.split('\n').map((line, idx) => {
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
                          
                          if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
                            return (
                              <div key={idx} className="flex gap-2 ml-2">
                                <span className="text-blue-600 font-bold">•</span>
                                <span>{line.replace(/^[•\-*]\s*/, '')}</span>
                              </div>
                            );
                          }
                          
                          if (/^\d+\./.test(line.trim())) {
                            return (
                              <div key={idx} className="flex gap-2 ml-2">
                                <span className="text-blue-600 font-bold">{line.match(/^\d+\./)[0]}</span>
                                <span>{line.replace(/^\d+\.\s*/, '')}</span>
                              </div>
                            );
                          }
                          
                          if (line.trim().endsWith(':') && line.trim().length > 3) {
                            return (
                              <div key={idx} className="font-bold text-blue-900 mt-3 mb-1">
                                {line}
                              </div>
                            );
                          }
                          
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
                    {t.analyzeAnother}
                  </button>
                  <button
                    onClick={() => setShareModal(true)}
                    className="py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>{t.shareToCommunity}</span>
                  </button>
                  <button
                    className="py-3 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <Phone className="w-5 h-5" />
                    <span>{t.consultExpert}</span>
                  </button>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg">
              <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2 text-lg">
                <TrendingUp className="w-6 h-6" />
                <span>{t.tipsForBetterResults}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {t.tips.map((tip, idx) => (
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
                  <span>{t.recentAnalyses}</span>
                </h3>
                <button
                  onClick={loadSavedAnalyses}
                  disabled={loadingHistory}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {loadingHistory ? t.loading : t.refresh}
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
                  <p className="text-gray-500 font-medium">{t.noAnalysesYet}</p>
                  <p className="text-gray-400 text-sm mt-1">{t.uploadToStart}</p>
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
                            {analysis.disease || (language === 'telugu' ? 'విశ్లేషణ' : 'Analysis')}
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
                            {new Date(analysis.uploaded_at).toLocaleDateString(language === 'telugu' ? 'te-IN' : 'en-US', {
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
                  {t.shareToCommunityTitle}
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
                  {t.postTitle}
                </label>
                <input
                  type="text"
                  value={shareData.title}
                  onChange={(e) => setShareData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                  placeholder={language === 'telugu' ? 'మీ పోస్ట్‌కు వివరణాత్మక శీర్షిక ఇవ్వండి' : 'Give your post a descriptive title'}
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-gray-500" />
                  {t.description}
                </label>
                <textarea
                  value={shareData.content}
                  onChange={(e) => setShareData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                  rows="6"
                  placeholder={language === 'telugu' ? 'మీ సమస్యను మరియు మీకు కావలసిన సహాయాన్ని వివరించండి...' : 'Describe your issue and what help you need...'}
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-500" />
                  {t.tags}
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder={t.addTag}
                  />
                  <button
                    onClick={addTag}
                    className="px-6 py-2 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                  >
                    {t.add}
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
                  <p className="text-sm font-bold text-gray-700 mb-3">{t.analysisPreview}:</p>
                  <div className="flex gap-4 bg-white rounded-lg p-3 shadow-sm">
                    <img 
                      src={result.imageUrl} 
                      alt="Analysis" 
                      className="w-24 h-24 rounded-lg object-cover shadow-md border-2 border-gray-200"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900 mb-1">{result.disease}</p>
                      <p className="text-xs text-gray-600 mb-2">
                        {language === 'telugu' ? 'విశ్వాసం' : 'Confidence'}: {(result.confidence * 100).toFixed(0)}%
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
                  {t.cancel}
                </button>
                <button
                  onClick={handleShareToCommunity}
                  disabled={sharing || !shareData.title || !shareData.content}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  {sharing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>{t.sharing}</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-5 h-5" />
                      <span>{t.shareToForum}</span>
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