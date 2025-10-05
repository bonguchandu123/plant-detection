import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Loader, MessageCircle, X, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const VoiceAssistant = () => {
  const [vapi, setVapi] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState([]);
  const [vapiConfig, setVapiConfig] = useState(null);
  const [userContext, setUserContext] = useState(null);
  const [error, setError] = useState(null);
  const [initStatus, setInitStatus] = useState('Initializing...');
  const [volumeLevel, setVolumeLevel] = useState(0);
  const messagesEndRef = useRef(null);
  const callTimeoutRef = useRef(null);
  const {getToken, user} = useAuth();

  const API_BASE = 'http://localhost:8000';

  useEffect(() => {
    initializeVapi();
    return () => {
      if (vapi) {
        try {
          vapi.stop();
        } catch (e) {
          console.log('Cleanup:', e);
        }
      }
      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

 

  const addMessage = (role, content) => {
    setMessages(prev => [...prev, {
      role,
      content,
      timestamp: new Date().toISOString(),
      id: Date.now() + Math.random()
    }]);
  };

  const initializeVapi = async () => {
    try {
      setInitStatus('Loading configuration...');
      const token = getToken();
      
      if (!token) {
        setError('Please login first');
        setInitStatus('Not logged in');
        return;
      }

      // Fetch config
      const configRes = await fetch(`${API_BASE}/api/vapi/config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!configRes.ok) {
        throw new Error('Failed to fetch config');
      }

      const config = await configRes.json();
      
      if (!config.publicKey || !config.assistantId) {
        throw new Error('Invalid VAPI configuration');
      }
      
      setVapiConfig(config);

      // Fetch user context
      const contextRes = await fetch(`${API_BASE}/api/vapi/user-context`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!contextRes.ok) {
        throw new Error('Failed to fetch user context');
      }

      const context = await contextRes.json();
      setUserContext(context);

      setInitStatus('Initializing VAPI...');

      // Import VAPI
      const VapiModule = await import('@vapi-ai/web');
      const Vapi = VapiModule.default;
      
      const vapiInstance = new Vapi(config.publicKey);
      
      // Event: Call Start
      vapiInstance.on('call-start', () => {
        console.log('Call started');
        setIsCallActive(true);
        setIsConnecting(false);
        setError(null);
        
        if (callTimeoutRef.current) {
          clearTimeout(callTimeoutRef.current);
        }
        
        addMessage('system', `Connected! Ready to help you, ${context.userName}.`);
      });
      
      // Event: Call End
      vapiInstance.on('call-end', () => {
        console.log('Call ended');
        setIsCallActive(false);
        setIsConnecting(false);
        setIsSpeaking(false);
        setVolumeLevel(0);
        
        if (callTimeoutRef.current) {
          clearTimeout(callTimeoutRef.current);
        }
      });
      
      // Event: Speech Start
      vapiInstance.on('speech-start', () => {
        setIsSpeaking(true);
      });
      
      // Event: Speech End
      vapiInstance.on('speech-end', () => {
        setIsSpeaking(false);
      });
      
      // Event: Volume Level
      vapiInstance.on('volume-level', (level) => {
        setVolumeLevel(level);
      });
      
      // Event: Message
      vapiInstance.on('message', (message) => {
        console.log('Message:', message.type, message);
        
        // Handle transcripts
        if (message.type === 'transcript' && message.transcriptType === 'final') {
          if (message.role === 'user' && message.transcript?.trim()) {
            addMessage('user', message.transcript);
          } else if (message.role === 'assistant' && message.transcript?.trim()) {
            addMessage('assistant', message.transcript);
          }
        }
        
        // Handle function calls
        if (message.type === 'function-call') {
          console.log('Function call:', message.functionCall);
        }
        
        // Handle conversation updates
        if (message.type === 'conversation-update') {
          console.log('Conversation update:', message);
        }
      });
      
      // Event: Error
      vapiInstance.on('error', (error) => {
        console.error('VAPI Error:', error);
        
        setIsConnecting(false);
        setIsCallActive(false);
        setIsSpeaking(false);
        
        // Parse error message
        let errorMessage = 'Connection error';
        
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        
        // Don't show "ended" errors for active calls
        if (errorMessage.toLowerCase().includes('ended') && isCallActive) {
          return;
        }
        
        // Handle specific error types
        if (error.type === 'start-method-error') {
          if (error.error?.type === 'cors') {
            errorMessage = 'Network error. Please check your internet connection and try again.';
          } else if (error.error?.status === 401) {
            errorMessage = 'Authentication failed. Please check your VAPI keys.';
          } else if (error.error?.status === 404) {
            errorMessage = 'Assistant not found. Please verify the Assistant ID.';
          }
        }
        
        setError(errorMessage);
        addMessage('system', `Error: ${errorMessage}`);
      });
      
      setVapi(vapiInstance);
      setInitStatus('Ready');
      console.log('VAPI initialized successfully');
      
    } catch (error) {
      console.error('Initialization failed:', error);
      setError(error.message || 'Failed to initialize');
      setInitStatus('Failed');
    }
  };

  const startCall = async () => {
    if (!vapi || !vapiConfig || !userContext) {
      setError('Assistant not ready. Please refresh.');
      return;
    }
    
    setIsConnecting(true);
    setError(null);
    addMessage('system', 'Connecting...');
    
    try {
      console.log('Starting call with assistant:', vapiConfig.assistantId);
      
      // Start the call
      await vapi.start(vapiConfig.assistantId);
      
      console.log('Call start initiated');
      
      // Timeout to detect connection issues
      callTimeoutRef.current = setTimeout(() => {
        if (!isCallActive) {
          console.warn('Connection timeout');
          setIsConnecting(false);
          setError('Connection timeout. Please try again.');
          addMessage('system', 'Connection timeout. Please try again.');
          vapi.stop();
        }
      }, 15000); // 15 second timeout
      
    } catch (error) {
      console.error('Start call failed:', error);
      setIsConnecting(false);
      
      let errorMsg = 'Failed to start call. ';
      
      if (error.message?.includes('permission') || error.message?.includes('NotAllowedError')) {
        errorMsg += 'Please allow microphone access.';
      } else if (error.message?.includes('NotFoundError')) {
        errorMsg += 'No microphone detected.';
      } else if (error.message?.includes('NotSupportedError')) {
        errorMsg += 'Your browser may not support voice calls. Try Chrome or Edge.';
      } else {
        errorMsg += error.message || 'Please try again.';
      }
      
      setError(errorMsg);
      addMessage('system', `Error: ${errorMsg}`);
    }
  };

  const endCall = () => {
    if (vapi && isCallActive) {
      console.log('Ending call');
      vapi.stop();
      addMessage('system', 'Call ended');
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setError(null);
  };

  const retryInit = () => {
    setError(null);
    setInitStatus('Initializing...');
    initializeVapi();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-green-800 mb-2">
            Voice Assistant
          </h1>
          <p className="text-gray-600">
            Ask about farming in Telugu or English
          </p>
          {userContext && (
            <p className="text-sm text-gray-500 mt-2">
              Namaste <span className="font-medium">{userContext.userName}</span> from {userContext.location}
            </p>
          )}
        </div>

        {/* Initialization Status */}
        {initStatus !== 'Ready' && (
          <div className={`border rounded-lg p-4 mb-6 ${
            initStatus === 'Failed' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center gap-3">
              {initStatus === 'Failed' ? (
                <AlertCircle className="w-5 h-5 text-red-600" />
              ) : (
                <Loader className="w-5 h-5 text-blue-600 animate-spin" />
              )}
              <div className="flex-1">
                <p className={`font-medium ${initStatus === 'Failed' ? 'text-red-900' : 'text-blue-900'}`}>
                  {initStatus}
                </p>
                {initStatus === 'Failed' && (
                  <button
                    onClick={retryInit}
                    className="text-sm text-blue-600 hover:text-blue-700 mt-1"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-red-900 font-semibold">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main Call Interface */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          <div className="flex flex-col items-center space-y-6">
            
            {/* Call Button */}
            <div className="relative">
              <button
                onClick={isCallActive ? endCall : startCall}
                disabled={isConnecting || initStatus !== 'Ready'}
                className={`w-40 h-40 rounded-full flex items-center justify-center transition-all shadow-2xl ${
                  isConnecting ? 'bg-gray-400' :
                  isCallActive ? 'bg-red-500 hover:bg-red-600' :
                  'bg-green-500 hover:bg-green-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isConnecting ? (
                  <Loader className="w-20 h-20 text-white animate-spin" />
                ) : isCallActive ? (
                  <PhoneOff className="w-20 h-20 text-white" />
                ) : (
                  <Phone className="w-20 h-20 text-white" />
                )}
              </button>
              
              {isCallActive && (
                <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-20" />
              )}
              
              {/* Volume indicator */}
              {isCallActive && volumeLevel > 0 && (
                <div 
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-2 bg-gray-200 rounded-full overflow-hidden"
                >
                  <div 
                    className="h-full bg-green-500 transition-all duration-100"
                    style={{ width: `${Math.min(volumeLevel * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>

            {/* Status Text */}
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-800">
                {isConnecting ? 'Connecting...' :
                 isCallActive ? isSpeaking ? 'Speaking...' : 'Listening...' :
                 'Tap to Start'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {isCallActive ? 'Speak naturally in Telugu or English' : 
                 initStatus === 'Ready' ? 'Ready to help you' : initStatus}
              </p>
            </div>

            {/* Call Indicators */}
            {isCallActive && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-red-600">LIVE</span>
                </div>
                
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                  isSpeaking ? 'bg-green-50' : 'bg-gray-50'
                }`}>
                  {isSpeaking ? 
                    <Mic className="w-4 h-4 text-green-600" /> : 
                    <MicOff className="w-4 h-4 text-gray-400" />
                  }
                  <span className={`text-sm font-medium ${
                    isSpeaking ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {isSpeaking ? 'Speaking' : 'Idle'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Conversation History */}
        {messages.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Conversation ({messages.length})
                </h3>
              </div>
              <button 
                onClick={clearMessages} 
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                    msg.role === 'user' ? 'bg-green-500 text-white' :
                    msg.role === 'assistant' ? 'bg-blue-100 text-gray-800' :
                    'bg-yellow-50 text-yellow-800 w-full text-center border border-yellow-200'
                  }`}>
                    {msg.role !== 'system' && (
                      <p className="text-xs font-medium mb-1 opacity-70">
                        {msg.role === 'user' ? 'You' : 'Assistant'}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <p className="text-xs opacity-50 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Help Text */}
        {!isCallActive && messages.length === 0 && initStatus === 'Ready' && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mt-6">
            <h3 className="font-bold text-gray-800 mb-3">How to use:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Tap the microphone button to start</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Speak clearly about your crop issues</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Get instant advice in Telugu or English</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <span>Ask about diseases, treatments, weather, and more</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceAssistant;