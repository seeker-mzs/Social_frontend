import React from 'react';
import { useAuth } from '../context/AuthContext';

const Feed = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Feed</h1>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md mb-4">
          <h2 className="text-xl font-semibold mb-2">Welcome, {user?.name}!</h2>
          <p className="text-gray-600">This is your social media feed. Posts from people you follow will appear here.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Create a new post</h3>
          <textarea 
            placeholder="What's on your mind?"
            className="w-full p-3 border border-gray-300 rounded mb-3"
            rows="3"
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Post
          </button>
        </div>

        {/* Example post - we'll replace with real data later */}
        <div className="bg-white p-6 rounded-lg shadow-md mt-4">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
            <div>
              <h4 className="font-semibold">John Doe</h4>
              <p className="text-sm text-gray-500">2 hours ago</p>
            </div>
          </div>
          <p className="mb-3">Just built an awesome social media app with React and Laravel! 🚀</p>
          <div className="flex space-x-4 text-gray-500">
            <button className="hover:text-blue-600">Like</button>
            <button className="hover:text-green-600">Comment</button>
            <button className="hover:text-gray-700">Share</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;