import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Phone, X, Volume2, VolumeX, Send, Sparkles, Loader, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Update this to match your backend URL and port
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const VoiceAgent = () => {
  // Mock auth for demo - replace with your actual auth context
  
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [vapiConfig, setVapiConfig] = useState(null);
  const [userContext, setUserContext] = useState(null);
  const [suggestedActions, setSuggestedActions] = useState([]);
  const [error, setError] = useState(null);
  const [textMode, setTextMode] = useState(false);
  const [textInput, setTextInput] = useState('');
  const {getToken} = useAuth();
  
  const vapiInstanceRef = useRef(null);
  const transcriptEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchVapiConfig();
      fetchUserContext();
    }
  }, [isOpen]);

  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript]);

  const fetchVapiConfig = async () => {
    try {
      const token = getToken();
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/vapi/config`, {
        method: 'GET',
        headers,
        mode: 'cors' // Explicitly set CORS mode
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setVapiConfig(data);
      
      // Auto-switch to text mode if VAPI not configured
      if (!data.publicKey || data.publicKey === 'your_vapi_public_key') {
        setTextMode(true);
        setError('Voice mode not configured. Using text chat instead.');
      }
    } catch (error) {
      console.error('Error fetching VAPI config:', error);
      setError(`Failed to connect to backend. Please ensure:\n1. Backend is running on ${API_BASE_URL}\n2. CORS is configured\n3. API endpoint is accessible`);
      setTextMode(true); // Fallback to text mode
    }
  };

  const fetchUserContext = async () => {
    try {
      const token = getToken();
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/vapi/user-context`, {
        method: 'GET',
        headers,
        mode: 'cors'
      });

      if (response.ok) {
        const data = await response.json();
        setUserContext(data);
      }
    } catch (error) {
      console.error('Error fetching user context:', error);
      // Non-critical, continue without context
    }
  };

// Enhanced startCall function with detailed error handling and debugging

const startCall = async () => {
  if (!vapiConfig) {
    setError('Voice agent not configured. Please add VAPI credentials to backend.');
    return;
  }

  if (!vapiConfig.publicKey || vapiConfig.publicKey === 'your_vapi_public_key') {
    setError('VAPI not configured. Using text chat instead.');
    setTextMode(true);
    return;
  }

  setIsLoading(true);
  setError(null);

  try {
    // Request microphone permission first
    console.log('🎤 Requesting microphone permission...');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
    console.log('✅ Microphone permission granted');

    // Dynamically import VAPI SDK
    console.log('📦 Loading VAPI SDK...');
    const { default: Vapi } = await import('@vapi-ai/web');
    console.log('✅ VAPI SDK loaded');
    
    const vapi = new Vapi(vapiConfig.publicKey);
    vapiInstanceRef.current = vapi;

    // Set up event listeners BEFORE starting the call
    vapi.on('call-start', () => {
      console.log('✅ Call started successfully');
      setIsConnected(true);
      setIsLoading(false);
      addTranscript('system', 'Voice assistant connected! How can I help you today?');
    });

    vapi.on('call-end', () => {
      console.log('📞 Call ended');
      setIsConnected(false);
      addTranscript('system', 'Call ended. Feel free to start a new conversation anytime!');
    });

    vapi.on('speech-start', () => {
      console.log('🎤 User started speaking');
    });

    vapi.on('speech-end', () => {
      console.log('🎤 User stopped speaking');
    });

    vapi.on('message', (message) => {
      console.log('📨 Message received:', message);
      
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        if (message.role === 'user') {
          addTranscript('user', message.transcript);
        } else if (message.role === 'assistant') {
          addTranscript('assistant', message.transcript);
        }
      }

      if (message.type === 'function-call') {
        console.log('⚡ Function call:', message.functionCall?.name);
        handleFunctionCall(message);
      }
    });

    vapi.on('error', async (error) => {
      console.error('❌ VAPI Error Details:', {
        type: error.type,
        stage: error.stage,
        error: error.error,
        message: error.message,
        totalDuration: error.totalDuration
      });

      // Try to extract more detailed error info
      let errorMessage = 'Voice assistant error occurred.';
      let detailedInfo = '';

      if (error.error) {
        // If error is a Response object, try to read it
        if (error.error instanceof Response) {
          try {
            const errorBody = await error.error.json();
            console.error('Error Response Body:', errorBody);
            detailedInfo = errorBody.message || errorBody.error || JSON.stringify(errorBody);
          } catch (e) {
            try {
              const errorText = await error.error.text();
              console.error('Error Response Text:', errorText);
              detailedInfo = errorText;
            } catch (e2) {
              console.error('Could not parse error response');
            }
          }
        } else if (error.error.message) {
          detailedInfo = error.error.message;
        }
      }

      // Provide specific error messages based on error type
      if (error.type === 'start-method-error') {
        errorMessage = 'Failed to start VAPI call.\n\n';
        
        if (detailedInfo.includes('assistant') || detailedInfo.includes('not found')) {
          errorMessage += '❌ Assistant ID may be invalid or not found.\n\nPossible solutions:\n';
          errorMessage += '1. Verify your Assistant ID in VAPI dashboard\n';
          errorMessage += '2. Check if assistant is published/active\n';
          errorMessage += '3. Ensure Public Key matches the assistant\'s account\n';
          errorMessage += `\nCurrent Assistant ID: ${vapiConfig.assistantId}`;
        } else if (detailedInfo.includes('API key') || detailedInfo.includes('unauthorized')) {
          errorMessage += '❌ Authentication failed.\n\nPossible solutions:\n';
          errorMessage += '1. Verify your VAPI Public Key is correct\n';
          errorMessage += '2. Check if your VAPI account is active\n';
          errorMessage += '3. Regenerate API keys if needed';
        } else if (detailedInfo.includes('quota') || detailedInfo.includes('limit')) {
          errorMessage += '❌ API quota exceeded or limit reached.\n';
          errorMessage += 'Check your VAPI account usage limits.';
        } else {
          errorMessage += `Error: ${detailedInfo}\n\n`;
          errorMessage += 'Try these steps:\n';
          errorMessage += '1. Check VAPI dashboard for any account issues\n';
          errorMessage += '2. Verify assistant configuration\n';
          errorMessage += '3. Test with a different assistant or create a new one';
        }
        
        // Switch to text mode as fallback
        setTextMode(true);
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
      
      setError(errorMessage);
      setIsLoading(false);
      setIsConnected(false);
    });

    console.log('🚀 Starting VAPI call...');
    console.log('Assistant ID:', vapiConfig.assistantId);
    console.log('Public Key:', vapiConfig.publicKey.substring(0, 10) + '...');

    // Option 1: Start with Assistant ID (recommended)
    if (vapiConfig.assistantId && vapiConfig.assistantId !== 'your_vapi_assistant_id') {
      console.log('Using existing assistant configuration');
      
      await vapi.start(vapiConfig.assistantId);
      
    } else {
      // Option 2: Start with inline configuration
      console.log('Using inline assistant configuration');
      
      const assistantConfig = {
        name: "Farm Assistant",
        firstMessage: "Hello! I'm your farm assistant. How can I help you today?",
        
        // Model configuration
        model: {
          provider: "openai",
          model: "gpt-4o-mini", // Updated to newer model
          temperature: 0.7,
          messages: [
            {
              role: "system",
              content: `You are a helpful farm assistant for Indian farmers. You help with:
- Identifying crop diseases from descriptions
- Suggesting organic treatments and solutions
- Providing seasonal farming advice
- Sharing traditional farming practices
- Weather-related guidance
- Community support

Keep responses concise (2-3 sentences max). Be friendly and supportive.
${userContext ? `User info: ${JSON.stringify(userContext)}` : ''}`
            }
          ]
        },
        
        // Voice configuration
        voice: {
          provider: "playht",
          voiceId: "jennifer"
        },
        
        // Transcriber configuration
        transcriber: {
          provider: "deepgram",
          model: "nova-2",
          language: "en-US",
          smartFormat: true
        },
        
        // Optional: Add function calling
        functions: [
          {
            name: "get_crop_analysis",
            description: "Get recent crop disease analysis for the user",
            parameters: {
              type: "object",
              properties: {
                limit: {
                  type: "number",
                  description: "Number of recent analyses to fetch"
                }
              }
            }
          },
          {
            name: "search_solutions",
            description: "Search for organic farming solutions",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "The disease or problem to search solutions for"
                }
              },
              required: ["query"]
            }
          }
        ]
      };

      await vapi.start(assistantConfig);
    }

    console.log('✅ VAPI start call initiated');

  } catch (error) {
    console.error('❌ Error in startCall:', error);
    
    let errorMessage = 'Failed to start voice call.';
    
    if (error.name === 'NotAllowedError') {
      errorMessage = '🎤 Microphone permission denied.\n\nPlease:\n1. Allow microphone access in your browser\n2. Reload the page and try again\n\nUsing text chat instead.';
    } else if (error.name === 'NotFoundError') {
      errorMessage = '🎤 No microphone found.\n\nPlease connect a microphone and try again.\n\nUsing text chat instead.';
    } else if (error.message) {
      errorMessage = `Error: ${error.message}\n\nUsing text chat instead.`;
    }
    
    setError(errorMessage);
    setIsLoading(false);
    setTextMode(true);
  }
};

// Also add this helper to check VAPI configuration
const checkVAPIConfiguration = async () => {
  console.log('🔍 Checking VAPI Configuration...');
  console.log('Public Key:', vapiConfig?.publicKey ? '✅ Set' : '❌ Missing');
  console.log('Assistant ID:', vapiConfig?.assistantId || '❌ Not set (will use inline config)');
  
  // Test VAPI SDK availability
  try {
    const { default: Vapi } = await import('@vapi-ai/web');
    console.log('✅ VAPI SDK loaded successfully');
    console.log('SDK Version:', Vapi.version || 'Unknown');
  } catch (error) {
    console.error('❌ Failed to load VAPI SDK:', error);
    setError('VAPI SDK not installed. Run: npm install @vapi-ai/web');
  }
};

  const endCall = () => {
    if (vapiInstanceRef.current) {
      vapiInstanceRef.current.stop();
      vapiInstanceRef.current = null;
      setIsConnected(false);
    }
  };

  const toggleMute = () => {
    if (vapiInstanceRef.current) {
      vapiInstanceRef.current.setMuted(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const handleFunctionCall = async (message) => {
    try {
      const token = getToken();
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/vapi/function-call`, {
        method: 'POST',
        headers,
        mode: 'cors',
        body: JSON.stringify({ message })
      });
      
      const data = await response.json();
      
      if (vapiInstanceRef.current && data.result) {
        vapiInstanceRef.current.send({
          type: 'function-call-result',
          functionCallId: message.functionCallId,
          result: data.result
        });
      }
    } catch (error) {
      console.error('Function call error:', error);
    }
  };

  const addTranscript = (role, text) => {
    setTranscript(prev => [...prev, {
      role,
      text,
      timestamp: new Date()
    }]);
  };

  const handleQuickAction = async (query) => {
    addTranscript('user', query);
    setIsLoading(true);
    
    try {
      const token = getToken();
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/vapi/query`, {
        method: 'POST',
        headers,
        mode: 'cors',
        body: JSON.stringify({ query })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      addTranscript('assistant', data.response);
      
      if (data.suggested_actions) {
        setSuggestedActions(data.suggested_actions);
      }
    } catch (error) {
      console.error('Query error:', error);
      addTranscript('system', `Error: Could not connect to backend at ${API_BASE_URL}. Please check if the server is running.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    
    handleQuickAction(textInput);
    setTextInput('');
  };

  const quickActions = [
    { icon: '🌾', label: 'Analyze My Crop', query: 'Show me my recent crop analysis' },
    { icon: '🌿', label: 'Organic Solutions', query: 'What organic treatments do you recommend?' },
    { icon: '📅', label: 'Seasonal Advice', query: 'What should I plant this season?' },
    { icon: '🎓', label: 'Video Tutorials', query: 'Show me farming video tutorials' }
  ];

  return (
    <>
      {/* Floating Voice Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-300 z-50 group"
        >
          <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
          <Mic className="w-8 h-8 text-white relative z-10" />
          <span className="absolute -top-10 right-0 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Voice Assistant
          </span>
        </button>
      )}

      {/* Voice Agent Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isConnected ? 'bg-white animate-pulse' : 'bg-green-400'
              }`}>
                <Sparkles className={`w-6 h-6 ${isConnected ? 'text-green-600' : 'text-white'}`} />
              </div>
              <div>
                <h3 className="text-white font-semibold">Farm Assistant</h3>
                <p className="text-green-100 text-xs">
                  {isConnected ? '🟢 Connected' : isLoading ? 'Connecting...' : textMode ? '💬 Text Mode' : 'Ready to help'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                if (isConnected) endCall();
                setError(null);
                setTranscript([]);
              }}
              className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 m-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-800 whitespace-pre-line">{error}</p>
              </div>
            </div>
          )}

          {/* Transcript Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {transcript.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {textMode ? <Send className="w-10 h-10 text-green-600" /> : <Mic className="w-10 h-10 text-green-600" />}
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Farm Assistant
                </h4>
                <p className="text-gray-600 text-sm mb-6">
                  Ask me about crop diseases, organic solutions, seasonal advice, and more!
                </p>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickAction(action.query)}
                      disabled={isLoading}
                      className="bg-white hover:bg-green-50 border border-gray-200 rounded-lg p-3 text-left transition-colors disabled:opacity-50"
                    >
                      <div className="text-2xl mb-1">{action.icon}</div>
                      <div className="text-xs font-medium text-gray-700">{action.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              transcript.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    item.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      item.role === 'user'
                        ? 'bg-green-600 text-white'
                        : item.role === 'assistant'
                        ? 'bg-white border border-gray-200 text-gray-900'
                        : 'bg-blue-50 text-blue-900 text-center text-sm'
                    }`}
                  >
                    <p className="text-sm">{item.text}</p>
                    <p className={`text-xs mt-1 ${
                      item.role === 'user' ? 'text-green-100' : 'text-gray-500'
                    }`}>
                      {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
            
            {/* Suggested Actions */}
            {suggestedActions.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-700 mb-2">Suggested Actions:</p>
                <div className="space-y-2">
                  {suggestedActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => window.location.href = action.route}
                      className="w-full flex items-center justify-between bg-green-50 hover:bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      <span>{action.label}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div ref={transcriptEndRef} />
          </div>

          {/* Controls */}
          <div className="bg-white border-t border-gray-200 p-4">
            {textMode ? (
              <div>
                <form onSubmit={handleTextSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Type your question..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={!textInput.trim() || isLoading}
                    className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </form>
                {vapiConfig?.publicKey && vapiConfig.publicKey !== 'your_vapi_public_key' && (
                  <button
                    onClick={() => setTextMode(false)}
                    className="w-full mt-2 text-sm text-gray-600 hover:text-gray-900 py-2"
                  >
                    Switch to voice mode
                  </button>
                )}
              </div>
            ) : !isConnected ? (
              <button
                onClick={startCall}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center justify-center gap-3 font-semibold disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Phone className="w-5 h-5" />
                    Start Voice Call
                  </>
                )}
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={toggleMute}
                  className={`flex-1 ${
                    isMuted ? 'bg-yellow-500' : 'bg-gray-200'
                  } text-gray-900 py-3 rounded-xl hover:bg-opacity-80 transition-colors flex items-center justify-center gap-2 font-medium`}
                >
                  {isMuted ? (
                    <>
                      <MicOff className="w-5 h-5" />
                      Unmute
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-5 h-5" />
                      Mute
                    </>
                  )}
                </button>
                <button
                  onClick={endCall}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Phone className="w-5 h-5 rotate-135" />
                  End Call
                </button>
              </div>
            )}
            
            {isConnected && (
              <div className="mt-3 text-center">
                <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Listening...
                </div>
              </div>
            )}

            {!textMode && !isConnected && vapiConfig?.publicKey && vapiConfig.publicKey !== 'your_vapi_public_key' && (
              <button
                onClick={() => setTextMode(true)}
                className="w-full mt-2 text-sm text-gray-600 hover:text-gray-900 py-2"
              >
                Use text chat instead
              </button>
            )}
          </div>

          {/* Privacy Notice */}
          <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 text-center border-t">
            🔒 Your conversations are private and secure
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceAgent;