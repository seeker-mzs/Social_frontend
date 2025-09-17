// components/Feed.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import CommentSection from './CommentSection';
import UserLink from './UserLink';
import ImageUpload from './ImageUpload';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [openCommentSections, setOpenCommentSections] = useState({});

  // Fetch posts from API
  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts');
      setPosts(response.data.data || response.data);
    } catch (error) {
      setError('Failed to load posts');
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Create a new post with image - SIMPLIFIED VERSION
  const handleCreatePost = async (e) => {
    e.preventDefault();
    console.log('🔄 Create post started');

    // Validation
    if (!newPost.trim() && !selectedImage) {
      setError('Please write something or select an image');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      
      // Add content if provided
      if (newPost.trim()) {
        formData.append('content', newPost.trim());
      }
      
      // Add image if selected
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      console.log('📤 Sending form data with:', {
        hasContent: newPost.trim().length > 0,
        hasImage: !!selectedImage
      });

      const response = await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('✅ Post created successfully:', response.data);

      // Add the new post to the beginning of the list
      setPosts([response.data, ...posts]);
      setNewPost('');
      setSelectedImage(null);

    } catch (error) {
      console.error('❌ Error in create post:', error);
      
      if (error.response?.status === 422) {
        // Handle validation errors
        const validationErrors = error.response.data.errors;
        let errorMessage = 'Validation failed: ';
        
        if (validationErrors) {
          Object.values(validationErrors).forEach(messages => {
            errorMessage += Array.isArray(messages) ? messages.join(', ') : messages;
          });
        } else {
          errorMessage = error.response.data.message || 'Validation failed';
        }
        
        setError(errorMessage);
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to create post';
        setError(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleImageSelect = (file) => {
    console.log('🖼️ Image selected:', file.name, file.type, file.size);
    setSelectedImage(file);
    setError('');
  };

  const handleRemoveImage = () => {
    console.log('🗑️ Image removed');
    setSelectedImage(null);
  };

  // Toggle comment section for a post
  const toggleComments = (postId) => {
    setOpenCommentSections(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Refresh posts after a new comment is added
  const handleCommentAdded = () => {
    fetchPosts();
  };

  // Like a post
  const handleLikePost = async (postId) => {
    try {
      await api.post(`/posts/${postId}/like`);
      fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading posts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Feed</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {/* Create Post Form */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">Create a new post</h3>
          <form onSubmit={handleCreatePost}>
            <textarea 
              placeholder="What's on your mind?"
              className="w-full p-3 border border-gray-300 rounded mb-3 resize-none"
              rows="3"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              disabled={uploading}
            />
            
            {/* Image Upload Component */}
            <ImageUpload
              onImageSelect={handleImageSelect}
              selectedImage={selectedImage}
              onRemoveImage={handleRemoveImage}
            />

            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-500">
                {newPost.length}/500 characters
              </span>
              
              <button 
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                disabled={(!newPost.trim() && !selectedImage) || uploading}
              >
                {uploading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Posting...
                  </span>
                ) : (
                  'Post'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Posts List */}
        {posts.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <p className="text-gray-600">No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white p-6 rounded-lg shadow-md mb-4">
              {/* Post Header */}
              <div className="flex items-center mb-3">
                <UserLink user={post.user} />
                <p className="text-sm text-gray-500 ml-3">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
              
              {/* Post Content */}
              {post.content && (
                <p className="mb-4 text-gray-800">{post.content}</p>
              )}
              
              {/* Post Image */}
              {post.image_url && (
                <div className="mb-4">
                  <img
                    src={post.image_url}
                    alt="Post content"
                    className="w-full h-auto rounded-lg max-h-96 object-contain border"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              {/* Post Engagement Stats */}
              <div className="flex justify-between text-sm text-gray-500 mb-3 border-b pb-3">
                <span>{post.likes_count || 0} likes</span>
                <span>{post.comments_count || 0} comments</span>
              </div>
              
              {/* Post Action Buttons */}
              <div className="flex space-x-4 text-gray-500 text-sm">
                <button 
                  onClick={() => handleLikePost(post.id)}
                  className="hover:text-blue-600 flex-1 py-2 transition-colors"
                >
                  Like
                </button>
                <button 
                  onClick={() => toggleComments(post.id)}
                  className="hover:text-green-600 flex-1 py-2 transition-colors"
                >
                  Comment
                </button>
                <button className="hover:text-gray-700 flex-1 py-2 transition-colors">
                  Share
                </button>
              </div>

              {/* Comment Section */}
              <CommentSection 
                postId={post.id}
                isOpen={openCommentSections[post.id] || false}
                onCommentAdded={handleCommentAdded}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Feed;