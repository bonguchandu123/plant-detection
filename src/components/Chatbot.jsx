import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageCircle, ThumbsUp, ThumbsDown, RefreshCw, Minus, Maximize2, GripVertical } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:8000/api';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 450, y: window.innerHeight - 700 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef(null);
  const chatWindowRef = useRef(null);
  const {getToken} = useAuth();

  // Get token from localStorage
  
  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation history when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadHistory();
    }
  }, [isOpen]);

  // Dragging functionality
  const handleMouseDown = (e) => {
    if (e.target.closest('.drag-handle')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Boundary checks
      const maxX = window.innerWidth - 400;
      const maxY = window.innerHeight - 100;
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const loadHistory = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await axios.get(`${API_URL}/chatbot/history?limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.length > 0) {
        const historyMessages = [];
        response.data.reverse().forEach(conv => {
          historyMessages.push({
            text: conv.user_message,
            sender: 'user',
            timestamp: new Date(conv.timestamp)
          });
          historyMessages.push({
            text: conv.bot_response,
            sender: 'bot',
            timestamp: new Date(conv.timestamp),
            intent: conv.intent,
            confidence: conv.confidence,
            id: conv.id
          });
        });
        setMessages(historyMessages);
      } else {
        addBotMessage(
          "👋 Hello! I'm your farming assistant.\n\nI can help you with:\n• Crop disease identification\n• Organic treatments\n• Expert consultations\n• Weather updates\n• Seasonal advice\n\nWhat would you like to know?"
        );
      }
    } catch (error) {
      console.error('Error loading history:', error);
      addBotMessage("Hello! How can I help you today?");
    }
  };

  const addBotMessage = (text, suggestedActions = [], intent = null, confidence = 0, id = null) => {
    setMessages(prev => [...prev, {
      text,
      sender: 'bot',
      timestamp: new Date(),
      suggestedActions,
      intent,
      confidence,
      id
    }]);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, {
      text,
      sender: 'user',
      timestamp: new Date()
    }]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMsg = inputMessage.trim();
    setInputMessage('');
    addUserMessage(userMsg);
    setIsTyping(true);
    setIsLoading(true);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('Please login to use chatbot');
      }

      const response = await axios.post(
        `${API_URL}/chatbot/message`,
        { message: userMsg },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsTyping(false);
      
      setTimeout(() => {
        addBotMessage(
          response.data.response,
          response.data.suggested_actions || [],
          response.data.intent,
          response.data.confidence
        );
        setIsLoading(false);
      }, 500);

    } catch (error) {
      setIsTyping(false);
      setIsLoading(false);
      
      const errorMsg = error.response?.data?.detail || error.message || 'Sorry, I encountered an error. Please try again.';
      addBotMessage(errorMsg);
    }
  };

  const handleQuickAction = (action) => {
    const actionMessages = {
      'upload': 'How do I upload a crop photo?',
      'solutions': 'Show me organic solutions',
      'specialist': 'I want to talk to a specialist',
      'weather': 'What\'s the weather forecast?',
      'community': 'How do I join the community?',
      'videos': 'Show me video tutorials',
      'diseases': 'Tell me about common diseases',
      'traditional': 'Show traditional farming methods',
      'calendar': 'Show seasonal calendar',
      'alerts': 'Show weather alerts',
      'chat': 'Start a chat consultation',
      'video': 'Book a video consultation',
      'post': 'How do I post a question?',
      'stories': 'Show success stories'
    };

    const message = actionMessages[action] || action.text || 'Tell me more';
    setInputMessage(message);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleFeedback = async (conversationId, helpful) => {
    try {
      const token = getToken();
      await axios.post(
        `${API_URL}/chatbot/feedback`,
        { 
          conversation_id: conversationId,
          helpful: helpful
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setMessages(prev => prev.map(msg => 
        msg.id === conversationId 
          ? { ...msg, feedbackGiven: true }
          : msg
      ));
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear all chat history?')) return;

    try {
      const token = getToken();
      await axios.delete(`${API_URL}/chatbot/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessages([]);
      addBotMessage("Chat history cleared. How can I help you today?");
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 flex items-center gap-3 group"
      >
        <MessageCircle size={24} className="group-hover:rotate-12 transition-transform" />
        <div className="hidden sm:block">
          <span className="font-bold block">AI Chat</span>
          <span className="text-xs text-blue-100">Get instant help</span>
        </div>
      </button>
    );
  }

  return (
    <div
      ref={chatWindowRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
      className="z-50"
      onMouseDown={handleMouseDown}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-[400px] flex flex-col overflow-hidden border border-gray-200">
        {/* Draggable Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between drag-handle cursor-move">
          <div className="flex items-center gap-2">
            <GripVertical size={20} className="text-blue-300" />
            <div className="bg-white rounded-full p-2 shadow-md">
              <MessageCircle size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-base">Farm AI Assistant</h3>
              <p className="text-xs text-blue-100 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                Online
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="hover:bg-blue-800 rounded-full p-2 transition"
              title="Minimize"
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minus size={16} />}
            </button>
            <button
              onClick={handleClearHistory}
              className="hover:bg-blue-800 rounded-full p-2 transition"
              title="Clear history"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-800 rounded-full p-2 transition"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Collapsible Content */}
        {!isMinimized && (
          <>
            {/* Messages Area */}
            <div className="h-[500px] overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white space-y-3">
              {messages.map((msg, index) => (
                <div key={index}>
                  <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl rounded-br-md'
                          : 'bg-white text-gray-800 shadow-md rounded-2xl rounded-bl-md border border-gray-100'
                      } p-3`}
                    >
                      <p className="text-sm whitespace-pre-line leading-relaxed">{msg.text}</p>
                      
                      {msg.sender === 'bot' && msg.confidence > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="bg-gray-100 rounded-full px-2 py-1 text-xs text-gray-600">
                            {msg.confidence > 0.7 ? '✓ Confident' : '~ Moderate'}
                          </div>
                        </div>
                      )}
                      
                      <span className="text-xs opacity-70 mt-1 block">
                        {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Suggested Actions */}
                  {msg.sender === 'bot' && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-2 ml-2 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {msg.suggestedActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuickAction(action.action)}
                            className="bg-white hover:bg-blue-50 border border-blue-200 hover:border-blue-400 rounded-lg px-3 py-1.5 text-xs transition shadow-sm hover:shadow-md flex items-center gap-1"
                          >
                            <span>{action.icon}</span>
                            <span>{action.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Feedback buttons */}
                  {msg.sender === 'bot' && msg.id && !msg.feedbackGiven && (
                    <div className="mt-2 ml-2 flex gap-2">
                      <button
                        onClick={() => handleFeedback(msg.id, true)}
                        className="text-gray-400 hover:text-green-600 transition"
                        title="Helpful"
                      >
                        <ThumbsUp size={14} />
                      </button>
                      <button
                        onClick={() => handleFeedback(msg.id, false)}
                        className="text-gray-400 hover:text-red-600 transition"
                        title="Not helpful"
                      >
                        <ThumbsDown size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 shadow-md p-3 rounded-2xl rounded-bl-md border border-gray-100">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl px-4 py-2 transition shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:shadow-none"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chatbot;

 