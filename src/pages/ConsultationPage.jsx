import React, { useState, useEffect, useRef } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, MessageCircle, Send, User, Clock, Star, X, PhoneCall, AlertCircle, RefreshCw, CheckCircle, Bell } from 'lucide-react';

const API_BASE = 'http://localhost:8000';
const WS_BASE = 'ws://localhost:8000';

export default function ConsultationPage() {
  const [view, setView] = useState('main');
  const [specialists, setSpecialists] = useState([]);
  const [activeChats, setActiveChats] = useState([]);
  const [videoRequests, setVideoRequests] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [notification, setNotification] = useState(null);
  
  const [videoRequestModal, setVideoRequestModal] = useState(false);
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
  const [videoRequestData, setVideoRequestData] = useState({
    topic: '',
    description: '',
    urgency: 'normal'
  });
  
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callStatus, setCallStatus] = useState('idle');
  const [callTimer, setCallTimer] = useState(0);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const callTimerRef = useRef(null);
  
  const token = localStorage.getItem('access_token');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isFarmer = currentUser.role === 'farmer';
  const isSpecialist = currentUser.role === 'specialist';

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (isFarmer && view === 'main') {
      fetchSpecialists();
    } else if (isSpecialist && view === 'main') {
      fetchPendingVideoRequests();
    } else if (view === 'chats') {
      fetchActiveChats();
    } else if (view === 'my-requests') {
      fetchMyVideoRequests();
    }
  }, [view]);

  useEffect(() => {
    if (isSpecialist) {
      const interval = setInterval(fetchPendingVideoRequests, 30000);
      return () => clearInterval(interval);
    }
  }, [isSpecialist]);

  useEffect(() => {
    if (isFarmer && view === 'my-requests') {
      const interval = setInterval(fetchMyVideoRequests, 5000);
      return () => clearInterval(interval);
    }
  }, [view, isFarmer]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (callStatus === 'connected') {
      callTimerRef.current = setInterval(() => {
        setCallTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      setCallTimer(0);
    }
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [callStatus]);

  const formatCallTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchSpecialists = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/specialists/available`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch specialists');
      const data = await response.json();
      setSpecialists(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveChats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/consultations/chats/active`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setActiveChats(data);
    } catch (err) {
      console.error('Error fetching chats:', err);
    }
  };

  const fetchMyVideoRequests = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/consultations/video-requests/my-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setVideoRequests(data);
      
      const justAccepted = data.find(r => r.status === 'accepted');
      if (justAccepted) {
        setNotification({
          type: 'success',
          message: `Video call request accepted! You can now start the call.`
        });
      }
    } catch (err) {
      console.error('Error fetching video requests:', err);
    }
  };

  const fetchPendingVideoRequests = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/consultations/video-requests/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setVideoRequests(data);
      setPendingRequestsCount(data.length);
    } catch (err) {
      console.error('Error fetching pending requests:', err);
    }
  };

  const fetchMessages = async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE}/api/consultations/${sessionId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const startDirectChat = async (specialist) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/consultations/start-chat/${specialist.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          topic: `Chat with ${specialist.name}`,
          description: 'Direct chat consultation'
        })
      });

      if (!response.ok) throw new Error('Failed to start chat');

      const data = await response.json();
      setActiveSession({
        id: data.session_id,
        room_id: data.room_id,
        specialist_name: specialist.name,
        specialist_id: specialist.id,
        session_type: 'chat'
      });
      setView('chatSession');
      await fetchMessages(data.session_id);
      connectWebSocket(data.session_id);
      setNotification({ type: 'success', message: 'Chat started!' });
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const openExistingChat = async (chat) => {
    setActiveSession({
      id: chat.id,
      specialist_name: chat.specialist_name,
      farmer_name: chat.farmer_name,
      session_type: 'chat'
    });
    setView('chatSession');
    await fetchMessages(chat.id);
    connectWebSocket(chat.id);
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !activeSession) return;
    try {
      await fetch(`${API_BASE}/api/consultations/${activeSession.id}/messages`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_type: 'text', message_text: messageText })
      });
      setMessageText('');
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const requestVideoCall = async () => {
    if (!videoRequestData.topic.trim()) {
      setNotification({ type: 'error', message: 'Please enter a topic' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/consultations/request-video/${selectedSpecialist.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(videoRequestData)
      });

      if (!response.ok) throw new Error('Failed to send request');

      setVideoRequestModal(false);
      setVideoRequestData({ topic: '', description: '', urgency: 'normal' });
      setNotification({ type: 'success', message: 'Video call request sent!' });
      setView('my-requests');
      fetchMyVideoRequests();
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const acceptVideoRequest = async (requestId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/consultations/${requestId}/accept-video`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to accept request');

      setNotification({ type: 'success', message: 'Request accepted! Farmer can now start the call.' });
      fetchPendingVideoRequests();
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const startVideoCall = async (request) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/consultations/${request.id}/start-video`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Cannot start video call');

      const data = await response.json();
      
      setActiveSession({
        id: request.id,
        room_id: data.room_id,
        specialist_name: request.specialist_name,
        farmer_name: request.farmer_name,
        session_type: 'video'
      });
      setView('activeCall');
      await initializeWebRTC(request.id);
      connectWebSocket(request.id);
    } catch (err) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const initializeWebRTC = async (sessionId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 }, 
        audio: true 
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      peerConnectionRef.current = peerConnection;

      stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setCallStatus('connected');
        }
      };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          sendWebRTCSignal(sessionId, 'ice_candidate', event.candidate);
        }
      };

      peerConnection.onconnectionstatechange = () => {
        if (peerConnection.connectionState === 'connected') {
          setCallStatus('connected');
        } else if (peerConnection.connectionState === 'failed') {
          setCallStatus('failed');
          setNotification({ type: 'error', message: 'Connection failed' });
        }
      };

      if (isFarmer) {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        sendWebRTCSignal(sessionId, 'offer', offer);
      }

      setCallStatus('connecting');
    } catch (err) {
      setNotification({ type: 'error', message: 'Failed to access camera/microphone' });
      endSession();
    }
  };

  const sendWebRTCSignal = async (sessionId, signalType, signalData) => {
    try {
      await fetch(`${API_BASE}/api/consultations/${sessionId}/webrtc-signal`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ signal_type: signalType, signal_data: signalData })
      });
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleWebRTCSignal = async (signalType, signalData) => {
    const peerConnection = peerConnectionRef.current;
    if (!peerConnection) return;

    try {
      if (signalType === 'offer') {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(signalData));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        sendWebRTCSignal(activeSession.id, 'answer', answer);
      } else if (signalType === 'answer') {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(signalData));
      } else if (signalType === 'ice_candidate') {
        await peerConnection.addIceCandidate(new RTCIceCandidate(signalData));
      }
    } catch (err) {
      console.error('WebRTC error:', err);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const connectWebSocket = (sessionId) => {
    wsRef.current = new WebSocket(`${WS_BASE}/ws/consultation/${sessionId}?token=${token}`);
    wsRef.current.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'webrtc_signal') {
        await handleWebRTCSignal(data.signal_type, data.signal_data);
      } else if (data.type === 'new_message') {
        setMessages(prev => [...prev, data.message]);
      }
    };
  };

  const endSession = async () => {
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) peerConnectionRef.current.close();
      if (wsRef.current) wsRef.current.close();

      if (activeSession) {
        await fetch(`${API_BASE}/api/consultations/${activeSession.id}/end`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      setActiveSession(null);
      setMessages([]);
      setCallStatus('idle');
      setView('main');
      setNotification({ type: 'success', message: 'Session ended' });
    } catch (err) {
      console.error('Error:', err);
    }
  };

  if (!isFarmer && !isSpecialist) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <AlertCircle className="mx-auto mb-4 text-yellow-600" size={48} />
          <p className="text-yellow-800 text-lg">Consultation feature is only available for farmers and specialists</p>
        </div>
      </div>
    );
  }

  if (view === 'chatSession') {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        <div className="bg-green-600 px-6 py-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <User size={24} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">
                {isFarmer ? activeSession?.specialist_name : activeSession?.farmer_name}
              </h2>
              <p className="text-green-100 text-sm flex items-center gap-2">
                <MessageCircle size={14} /> Chat consultation
              </p>
            </div>
          </div>
          <button onClick={endSession} className="px-6 py-2 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50">
            End Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="mx-auto mb-4 text-gray-300" size={64} />
              <p className="text-gray-500">Start the conversation</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex ${(msg.sender_role === 'farmer' && isFarmer) || (msg.sender_role === 'specialist' && isSpecialist) ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md px-4 py-3 rounded-lg ${(msg.sender_role === 'farmer' && isFarmer) || (msg.sender_role === 'specialist' && isSpecialist) ? 'bg-green-600 text-white' : 'bg-white text-gray-900 shadow-sm'}`}>
                  <p className="font-medium text-sm mb-1">{msg.sender_name}</p>
                  <p className="whitespace-pre-wrap">{msg.message_text}</p>
                  <p className="text-xs mt-1 opacity-75">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t bg-white p-4 shadow-lg">
          <div className="flex gap-3">
            <input 
              type="text" 
              value={messageText} 
              onChange={(e) => setMessageText(e.target.value)} 
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()} 
              placeholder="Type message..." 
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" 
            />
            <button 
              onClick={sendMessage} 
              disabled={!messageText.trim()} 
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'activeCall') {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
              <User size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">
                {isFarmer ? activeSession?.specialist_name : activeSession?.farmer_name}
              </h2>
              <p className="text-gray-300 text-sm">
                {callStatus === 'connected' ? `Connected - ${formatCallTime(callTimer)}` : 'Connecting...'}
              </p>
            </div>
          </div>
          <button onClick={endSession} className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700">
            End Call
          </button>
        </div>

        <div className="flex-1 relative bg-black">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          
          {callStatus !== 'connected' && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <div className="w-24 h-24 border-4 border-gray-600 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400 text-lg">Connecting...</p>
              </div>
            </div>
          )}

          <div className="absolute bottom-6 right-6 w-64 h-48 bg-gray-800 rounded-lg overflow-hidden shadow-2xl border-2 border-gray-700">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            {!isVideoEnabled && (
              <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                <User size={48} className="text-gray-400" />
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-800 px-6 py-6">
          <div className="flex items-center justify-center gap-6">
            <button onClick={toggleVideo} className={`p-5 rounded-full ${isVideoEnabled ? 'bg-gray-700' : 'bg-red-600'}`}>
              {isVideoEnabled ? <Video size={24} className="text-white" /> : <VideoOff size={24} className="text-white" />}
            </button>
            <button onClick={toggleAudio} className={`p-5 rounded-full ${isAudioEnabled ? 'bg-gray-700' : 'bg-red-600'}`}>
              {isAudioEnabled ? <Mic size={24} className="text-white" /> : <MicOff size={24} className="text-white" />}
            </button>
            <button onClick={endSession} className="p-5 rounded-full bg-red-600">
              <Phone size={24} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-xl ${
          notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white flex items-center gap-3`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Expert Consultation</h1>
        <p className="text-gray-600">{isFarmer ? 'Connect with specialists' : 'Manage consultation requests'}</p>
      </div>

      <div className="flex gap-4 mb-6 flex-wrap">
        {isFarmer && (
          <button 
            onClick={() => setView('main')} 
            className={`px-6 py-3 rounded-lg font-semibold ${view === 'main' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Find Specialists
          </button>
        )}
        
        {isSpecialist && (
          <button 
            onClick={() => setView('main')} 
            className={`px-6 py-3 rounded-lg font-semibold relative ${view === 'main' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Video Requests
            {pendingRequestsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {pendingRequestsCount}
              </span>
            )}
          </button>
        )}
        
        <button 
          onClick={() => setView('chats')} 
          className={`px-6 py-3 rounded-lg font-semibold ${view === 'chats' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          My Chats
        </button>
        
        {isFarmer && (
          <button 
            onClick={() => setView('my-requests')} 
            className={`px-6 py-3 rounded-lg font-semibold ${view === 'my-requests' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            My Video Requests
          </button>
        )}
      </div>

      {view === 'main' && isFarmer && (
        <div>
          {loading && <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto"></div></div>}
          {!loading && specialists.length === 0 && <div className="bg-gray-50 p-12 rounded-xl text-center"><p className="text-gray-600">No specialists available</p></div>}
          {!loading && specialists.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {specialists.map((specialist) => (
                <div key={specialist.id} className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 hover:shadow-xl transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center relative">
                      <User size={32} className="text-green-600" />
                      {specialist.is_online && <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{specialist.name}</h3>
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-600">{specialist.average_rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{specialist.experience_years} years experience</p>
                  <div className="flex gap-2">
                    <button onClick={() => startDirectChat(specialist)} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                      <MessageCircle size={18} /> Chat
                    </button>
                    <button onClick={() => { setSelectedSpecialist(specialist); setVideoRequestModal(true); }} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                      <PhoneCall size={18} /> Video
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'main' && isSpecialist && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Pending Video Call Requests</h2>
            <button onClick={fetchPendingVideoRequests} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2">
              <RefreshCw size={18} /> Refresh
            </button>
          </div>
          
          {loading && <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto"></div></div>}
          
          {!loading && videoRequests.length === 0 && (
            <div className="bg-gray-50 p-12 rounded-xl text-center">
              <PhoneCall className="mx-auto mb-4 text-gray-400" size={64} />
              <p className="text-gray-600 text-lg">No pending video requests</p>
              <p className="text-sm text-gray-500 mt-2">Farmer requests will appear here</p>
            </div>
          )}
          
          {!loading && videoRequests.length > 0 && (
            <div className="space-y-4">
              {videoRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <User size={24} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-xl">{request.farmer_name}</h3>
                          {request.farmer_phone && <p className="text-sm text-gray-600">{request.farmer_phone}</p>}
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-4 mb-3">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Topic:</p>
                        <p className="text-base text-gray-900">{request.topic}</p>
                      </div>
                      
                      {request.description && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-3">
                          <p className="text-sm font-semibold text-gray-700 mb-1">Details:</p>
                          <p className="text-sm text-gray-800">{request.description}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={14} />
                        <span>Requested: {new Date(request.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => acceptVideoRequest(request.id)} 
                      className="px-8 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg flex items-center justify-center gap-2 min-w-[200px]"
                      disabled={loading}
                    >
                      <CheckCircle size={22} />
                      {loading ? 'Accepting...' : 'Accept Request'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'chats' && (
        <div className="space-y-4">
          {activeChats.length === 0 ? (
            <div className="bg-gray-50 p-12 rounded-xl text-center">
              <MessageCircle className="mx-auto mb-4 text-gray-400" size={64} />
              <p className="text-gray-600 text-lg">No active chats</p>
            </div>
          ) : (
            activeChats.map((chat) => (
              <div key={chat.id} className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-100 hover:shadow-lg cursor-pointer" onClick={() => openExistingChat(chat)}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <User size={24} className="text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{isFarmer ? chat.specialist_name : chat.farmer_name}</h3>
                        <p className="text-sm text-gray-600">{chat.topic}</p>
                      </div>
                    </div>
                    {chat.last_message_text && <p className="text-sm text-gray-500 mt-3 ml-15">{chat.last_message_text}</p>}
                  </div>
                  {chat.unread_count > 0 && <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-bold">{chat.unread_count}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {view === 'my-requests' && isFarmer && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">My Video Call Requests</h2>
            <button onClick={fetchMyVideoRequests} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2">
              <RefreshCw size={18} /> Refresh
            </button>
          </div>
          
          {videoRequests.length === 0 ? (
            <div className="bg-gray-50 p-12 rounded-xl text-center">
              <PhoneCall className="mx-auto mb-4 text-gray-400" size={64} />
              <p className="text-gray-600 text-lg">No video requests yet</p>
              <p className="text-sm text-gray-500 mt-2">Request a video call from Find Specialists tab</p>
            </div>
          ) : (
            <div className="space-y-4">
              {videoRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <User size={24} className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-xl">{request.specialist_name}</h3>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 ${
                            request.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {request.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-4 mb-3">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Topic:</p>
                        <p className="text-base text-gray-900">{request.topic}</p>
                      </div>
                      
                      {request.description && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-3">
                          <p className="text-sm text-gray-800">{request.description}</p>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        <Clock size={14} className="inline mr-1" />
                        Requested: {new Date(request.created_at).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="min-w-[180px]">
                      {request.status === 'accepted' ? (
                        <button 
                          onClick={() => startVideoCall(request)} 
                          className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2 animate-pulse shadow-lg"
                          disabled={loading}
                        >
                          <Video size={22} />
                          {loading ? 'Starting...' : 'Start Video Call'}
                        </button>
                      ) : (
                        <div className="px-6 py-4 bg-yellow-100 border-2 border-yellow-500 text-yellow-800 rounded-xl font-bold text-center">
                          <Clock size={24} className="mx-auto mb-2" />
                          <p className="text-sm">Pending</p>
                          <p className="text-xs mt-1 font-normal">Waiting for specialist</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {videoRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Request Video Call</h2>
              <button onClick={() => setVideoRequestModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Specialist</label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User size={24} className="text-gray-600" />
                  <span className="font-medium">{selectedSpecialist?.name}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Topic <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={videoRequestData.topic}
                  onChange={(e) => setVideoRequestData(prev => ({ ...prev, topic: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Cotton pest problem"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea 
                  value={videoRequestData.description} 
                  onChange={(e) => setVideoRequestData(prev => ({ ...prev, description: e.target.value }))} 
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" 
                  rows="4" 
                  placeholder="Provide details..." 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Urgency</label>
                <select 
                  value={videoRequestData.urgency} 
                  onChange={(e) => setVideoRequestData(prev => ({ ...prev, urgency: e.target.value }))} 
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Video calls require specialist acceptance. You'll be notified when accepted.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setVideoRequestModal(false)} 
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50" 
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  onClick={requestVideoCall} 
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400" 
                  disabled={loading || !videoRequestData.topic.trim()}
                >
                  {loading ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}