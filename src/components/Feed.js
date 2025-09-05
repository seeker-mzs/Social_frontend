import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch posts from API
  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/posts');
      setPosts(response.data.data || response.data); // Handle both paginated and non-paginated responses
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

  // Create a new post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      const response = await axios.post('http://localhost:8000/api/posts', {
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
  const handleLikePost = async (postId) => {
    try {
      await axios.post(`http://localhost:8000/api/posts/${postId}/like`);
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
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                <div>
                  <h4 className="font-semibold">{post.user?.name || 'Unknown User'}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <p className="mb-4">{post.content}</p>
              
              <div className="flex space-x-4 text-gray-500">
                <button 
                  onClick={() => handleLikePost(post.id)}
                  className="hover:text-blue-600"
                >
                  Like ({post.likes_count || 0})
                </button>
                <button className="hover:text-green-600">
                  Comment ({post.comments_count || 0})
                </button>
                <button className="hover:text-gray-700">Share</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Feed;