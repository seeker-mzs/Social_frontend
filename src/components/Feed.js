import React, { useState, useEffect } from 'react';
import api from '../services/api'; // ADD THIS IMPORT
import CommentSection from './CommentSection';
import UserLink from './UserLink';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openCommentSections, setOpenCommentSections] = useState({});

  // Fetch posts from API
  const fetchPosts = async () => {
    try {
      // FIXED: Use api instead of axios to include auth token
      const response = await api.get('/posts');
      
      // Handle both response formats
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

  // Toggle comment section for a post
  const toggleComments = (postId) => {
    setOpenCommentSections(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Refresh posts after a new comment is added
  const handleCommentAdded = () => {
    fetchPosts(); // Refresh to update comment counts
  };

  // Create a new post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      // FIXED: Use api instead of axios
      const response = await api.post('/posts', {
        content: newPost
      });

      // Add the new post to the beginning of the list
      setPosts([response.data, ...posts]);
      setNewPost(''); // Clear the textarea
    } catch (error) {
      setError('Failed to create post');
      console.error('Error creating post:', error);
    }
  };

  // Like a post
  // Like a post
const handleLikePost = async (postId) => {
  try {
    // FIXED: Use api instead of axios
    await api.post(`/posts/${postId}/like`);
    // Refresh posts to get updated like status
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
              className="w-full p-3 border border-gray-300 rounded mb-3"
              rows="3"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
            />
            <button 
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
              disabled={!newPost.trim()}
            >
              Post
            </button>
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
              {/* Post Header with Clickable User Link */}
              <div className="flex items-center mb-3">
                <UserLink user={post.user} />
                <p className="text-sm text-gray-500 ml-3">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
              
              {/* Post Content */}
              <p className="mb-4 text-gray-800">{post.content}</p>
              
              {/* Post Engagement Stats */}
              <div className="flex justify-between text-sm text-gray-500 mb-3 border-b pb-3">
                <span>{post.likes_count || 0} likes</span>
                <span>{post.comments_count || 0} comments</span>
              </div>
              
              {/* Post Action Buttons */}
              <div className="flex space-x-4 text-gray-500 text-sm">
                <button 
                  onClick={() => handleLikePost(post.id)}
                  className="hover:text-blue-600 flex-1 py-2"
                >
                  Like
                </button>
                <button 
                  onClick={() => toggleComments(post.id)}
                  className="hover:text-green-600 flex-1 py-2"
                >
                  Comment
                </button>
                <button className="hover:text-gray-700 flex-1 py-2">
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