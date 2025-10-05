import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, ThumbsUp, Clock, User, Plus, X, Share2, CheckCircle, TrendingUp, MapPin, Image as ImageIcon, AlertCircle, Upload, Loader } from 'lucide-react';

const API_BASE = 'http://localhost:8000';
const WS_BASE = 'ws://localhost:8000';

export default function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newPostModal, setNewPostModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [newPost, setNewPost] = useState({ title: '', content_text: '', tags: [], is_question: false, media_urls: [] });
  const [tagInput, setTagInput] = useState('');
  const [filter, setFilter] = useState('all');
  const [trendingTags, setTrendingTags] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const ws = useRef(null);
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    if (!token) return;

    ws.current = new WebSocket(`${WS_BASE}/ws/chat`);
    
    ws.current.onopen = () => console.log('WebSocket connected');

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'new_post') {
        fetchPosts();
      } else if (data.type === 'new_comment' && selectedPost) {
        if (selectedPost.id === data.post_id) {
          fetchPostDetail(selectedPost.id);
        }
      }
    };

    return () => ws.current?.close();
  }, [token, selectedPost]);

  useEffect(() => {
    fetchPosts();
    fetchTrendingTags();
  }, [filter]);

  const fetchPosts = async () => {
    try {
      let url = `${API_BASE}/api/community/posts?limit=50`;
      
      if (filter === 'questions') url += '&is_question=true';
      if (filter === 'with-analysis') url += '&has_analysis=true';
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingTags = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/community/trending-topics?limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setTrendingTags(data);
    } catch (error) {
      console.error('Error fetching trending tags:', error);
    }
  };

  const fetchPostDetail = async (postId) => {
    try {
      const response = await fetch(`${API_BASE}/api/community/posts/${postId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSelectedPost(data);
    } catch (error) {
      console.error('Error fetching post detail:', error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image size should be less than 10MB');
      return;
    }

    setUploadingImage(true);
    setImagePreview(URL.createObjectURL(file));

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/api/community/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setNewPost(prev => ({
          ...prev,
          media_urls: [...prev.media_urls, data.image_url]
        }));
      } else {
        alert(data.detail || 'Failed to upload image');
        setImagePreview(null);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
      setImagePreview(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (indexToRemove) => {
    setNewPost(prev => ({
      ...prev,
      media_urls: prev.media_urls.filter((_, idx) => idx !== indexToRemove)
    }));
    if (indexToRemove === 0) {
      setImagePreview(null);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content_text) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/community/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPost)
      });

      if (response.ok) {
        setNewPostModal(false);
        setNewPost({ title: '', content_text: '', tags: [], is_question: false, media_urls: [] });
        setImagePreview(null);
        fetchPosts();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedPost) return;

    try {
      const response = await fetch(`${API_BASE}/api/community/posts/${selectedPost.id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment_text: commentText })
      });

      if (response.ok) {
        setCommentText('');
        fetchPostDetail(selectedPost.id);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      await fetch(`${API_BASE}/api/community/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchPosts();
      if (selectedPost?.id === postId) {
        fetchPostDetail(postId);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleMarkHelpful = async (postId) => {
    try {
      await fetch(`${API_BASE}/api/community/posts/${postId}/helpful`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchPosts();
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  const handleMarkSolved = async (postId) => {
    try {
      await fetch(`${API_BASE}/api/community/posts/${postId}/solve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchPostDetail(postId);
      fetchPosts();
    } catch (error) {
      console.error('Error marking solved:', error);
    }
  };

  const formatTimeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getPostImage = (post) => {
    if (post.media_urls && post.media_urls.length > 0) {
      return post.media_urls[0];
    }
    if (post.analysis_reference && post.analysis_reference.image_url) {
      return post.analysis_reference.image_url;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading community posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Community Forum</h1>
            <p className="text-gray-600">Connect, share, and learn from fellow farmers</p>
          </div>
          <button
            onClick={() => setNewPostModal(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus size={20} />
            New Post
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Posts Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Filter Buttons */}
            <div className="bg-white rounded-xl shadow-sm p-4 flex gap-3 overflow-x-auto border border-gray-100">
              {['all', 'questions', 'with-analysis'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-2.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
                    filter === f
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f === 'all' ? 'All Posts' : f === 'questions' ? 'Questions Only' : 'With Analysis'}
                </button>
              ))}
            </div>

            {/* Posts List */}
            {posts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600 mb-6">Be the first to share your experience!</p>
                <button
                  onClick={() => setNewPostModal(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 inline-flex items-center gap-2"
                >
                  <Plus size={18} />
                  Create First Post
                </button>
              </div>
            ) : (
              posts.map((post) => {
                const postImage = getPostImage(post);
                
                return (
                  <div
                    key={post.id}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer border border-gray-100 overflow-hidden group"
                    onClick={() => fetchPostDetail(post.id)}
                  >
                    {postImage && (
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={postImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage Not Available%3C/text%3E%3C/svg%3E';
                          }}
                        />
                        {post.analysis_reference && (
                          <div className="absolute top-3 left-3">
                            <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                              <AlertCircle size={14} />
                              AI Analysis
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-xl text-gray-900 flex-1 line-clamp-2 group-hover:text-green-600 transition-colors">
                          {post.title}
                        </h3>
                        {post.is_solved && (
                          <span className="flex items-center gap-1 text-green-600 text-sm font-semibold bg-green-50 px-3 py-1 rounded-full ml-3 flex-shrink-0">
                            <CheckCircle size={16} />
                            Solved
                          </span>
                        )}
                      </div>

                      {!postImage && post.analysis_reference && (
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <AlertCircle className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-blue-900">
                                {post.analysis_reference.disease}
                              </p>
                              <p className="text-xs text-blue-700">
                                AI Confidence: {(post.analysis_reference.confidence * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>
                      
                      {post.tags?.length > 0 && (
                        <div className="flex gap-2 mb-4 flex-wrap">
                          {post.tags.slice(0, 3).map((tag, idx) => (
                            <span key={idx} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                              #{tag}
                            </span>
                          ))}
                          {post.tags.length > 3 && (
                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">
                              +{post.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4 text-gray-600">
                          <span className="flex items-center gap-1.5 font-medium">
                            <User size={16} />
                            {post.author}
                          </span>
                          {post.location && (
                            <span className="flex items-center gap-1.5">
                              <MapPin size={14} />
                              {post.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <Clock size={16} />
                            {formatTimeAgo(post.created_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-gray-600">
                          <span className="flex items-center gap-1.5">
                            <MessageCircle size={16} />
                            {post.comments_count}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLikePost(post.id);
                            }}
                            className="flex items-center gap-1.5 hover:text-green-600 transition-colors"
                          >
                            <ThumbsUp size={16} />
                            {post.likes}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-green-600" />
                Trending Topics
              </h3>
              <div className="space-y-2">
                {trendingTags.length === 0 ? (
                  <p className="text-sm text-gray-500">No trending topics yet</p>
                ) : (
                  trendingTags.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {}}
                      className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 flex justify-between items-center transition-colors group"
                    >
                      <span className="text-gray-700 font-medium group-hover:text-green-600">#{item.tag}</span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{item.count}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl shadow-sm p-6 border-2 border-green-200">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-4">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">Share Your Analysis</h3>
              <p className="text-sm text-gray-600 mb-4">
                Got a crop analysis? Share it with the community to get expert advice!
              </p>
              <button
                onClick={() => setNewPostModal(true)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 flex items-center justify-center gap-2 font-semibold shadow-lg transition-all"
              >
                <Plus size={18} />
                Create Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal with Image Upload */}
      {newPostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  Create New Post
                </h2>
                <button
                  onClick={() => {
                    setNewPostModal(false);
                    setImagePreview(null);
                    setNewPost({ title: '', content_text: '', tags: [], is_question: false, media_urls: [] });
                  }}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-gray-500" />
                  Add Photos (Optional)
                </label>
                
                {/* Image Preview */}
                {newPost.media_urls.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {newPost.media_urls.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={url}
                          alt={`Upload ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-xl border-2 border-gray-200"
                        />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-500 hover:bg-green-50 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="post-image-upload"
                    disabled={uploadingImage}
                  />
                  <label
                    htmlFor="post-image-upload"
                    className="cursor-pointer block"
                  >
                    {uploadingImage ? (
                      <div className="flex flex-col items-center">
                        <Loader className="w-10 h-10 text-green-600 animate-spin mb-2" />
                        <p className="text-sm text-gray-600 font-medium">Uploading...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                          <Upload className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="text-sm text-gray-700 font-semibold mb-1">Click to upload images</p>
                        <p className="text-xs text-gray-500">JPG, PNG (max 10MB)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Question Checkbox */}
              <div>
                <label className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border-2 border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={newPost.is_question}
                    onChange={(e) => setNewPost(prev => ({ ...prev, is_question: e.target.checked }))}
                    className="w-5 h-5 text-green-600 rounded"
                  />
                  <span className="text-sm font-semibold text-gray-700">Mark as Question</span>
                </label>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Title</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium"
                  placeholder="What's your question or topic?"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Description</label>
                <textarea
                  value={newPost.content_text}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content_text: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium"
                  rows="6"
                  placeholder="Describe your question or share your experience..."
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Tags</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (tagInput.trim() && !newPost.tags.includes(tagInput.trim())) {
                          setNewPost(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim().toLowerCase()] }));
                          setTagInput('');
                        }
                      }
                    }}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    placeholder="Add tags (press Enter)"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {newPost.tags.map((tag, idx) => (
                    <span key={idx} className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 border-2 border-green-200">
                      #{tag}
                      <button
                        onClick={() => setNewPost(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))}
                        className="hover:text-green-900 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setNewPostModal(false);
                    setImagePreview(null);
                    setNewPost({ title: '', content_text: '', tags: [], is_question: false, media_urls: [] });
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePost}
                  disabled={!newPost.title || !newPost.content_text || uploadingImage}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg transition-all"
                >
                  Publish Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Detail Modal - Keep your existing code */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start rounded-t-3xl">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedPost.title}</h2>
                  {selectedPost.is_solved && (
                    <span className="flex items-center gap-1 text-green-600 text-sm font-semibold bg-green-50 px-4 py-2 rounded-full border-2 border-green-200">
                      <CheckCircle size={16} />
                      Solved
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5 font-medium">
                    <User size={16} />
                    {selectedPost.author}
                  </span>
                  {selectedPost.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} />
                      {selectedPost.location}
                    </span>
                  )}
                  <span>{formatTimeAgo(selectedPost.created_at)}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors ml-4"
              >
                <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="p-8">
              {/* Display main post image */}
              {(() => {
                const postImage = getPostImage(selectedPost);
                return postImage && (
                  <div className="mb-6 rounded-2xl overflow-hidden">
                    <img
                      src={postImage}
                      alt={selectedPost.title}
                      className="w-full max-h-96 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect fill="%23f3f4f6" width="800" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="24" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage Not Available%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                );
              })()}

              {/* Analysis Reference Card */}
              {selectedPost.analysis_reference && (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6 mb-6 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    AI Crop Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white bg-opacity-70 rounded-xl p-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1 font-medium">Disease Detected</p>
                      <p className="font-bold text-gray-900">{selectedPost.analysis_reference.disease}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1 font-medium">AI Confidence</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                            style={{width: `${selectedPost.analysis_reference.confidence * 100}%`}}
                          ></div>
                        </div>
                        <span className="font-bold text-gray-900 text-sm">
                          {(selectedPost.analysis_reference.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1 font-medium">Status</p>
                      <span className="inline-flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        <AlertCircle size={12} />
                        AI Analyzed
                      </span>
                    </div>
                  </div>
                  {selectedPost.analysis_reference.suggested_treatment && (
                    <div className="mt-4 bg-white bg-opacity-70 rounded-xl p-4">
                      <p className="text-xs text-gray-600 mb-2 font-bold">Suggested Treatment:</p>
                      <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                        {selectedPost.analysis_reference.suggested_treatment}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Post Content */}
              <div className="mb-6">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedPost.content}</p>
              </div>

              {/* Tags */}
              {selectedPost.tags?.length > 0 && (
                <div className="flex gap-2 mb-6 flex-wrap">
                  {selectedPost.tags.map((tag, idx) => (
                    <span key={idx} className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold border-2 border-green-200">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mb-6 pb-6 border-b-2 border-gray-100">
                <button
                  onClick={() => handleLikePost(selectedPost.id)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-all font-medium"
                >
                  <ThumbsUp size={18} />
                  <span>{selectedPost.likes} Likes</span>
                </button>
                <button
                  onClick={() => handleMarkHelpful(selectedPost.id)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-all font-medium"
                >
                  <CheckCircle size={18} />
                  <span>Helpful ({selectedPost.helpful_count})</span>
                </button>
                {selectedPost.is_question && !selectedPost.is_solved && (
                  <button
                    onClick={() => handleMarkSolved(selectedPost.id)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-all font-semibold border-2 border-green-200"
                  >
                    <CheckCircle size={18} />
                    Mark as Solved
                  </button>
                )}
              </div>

              {/* Comments Section */}
              <div>
                <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-gray-600" />
                  Comments ({selectedPost.comments?.length || 0})
                </h3>
                
                {/* Comments List */}
                <div className="space-y-4 mb-6">
                  {selectedPost.comments?.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No comments yet</p>
                      <p className="text-gray-400 text-sm">Be the first to share your thoughts!</p>
                    </div>
                  ) : (
                    selectedPost.comments?.map((comment) => (
                      <div key={comment.id} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{comment.user_name}</p>
                            <p className="text-xs text-gray-500">{formatTimeAgo(comment.created_at)}</p>
                          </div>
                        </div>
                        <p className="text-gray-800 leading-relaxed pl-13">{comment.comment_text}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment */}
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your thoughts or advice..."
                    className="flex-1 px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-lg transition-all"
                  >
                    <Send size={18} />
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}