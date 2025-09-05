import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  // For now, we'll just show the current user's profile
  const profileUser = user;

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-4">
          <div className="flex items-center mb-4">
            <div className="w-20 h-20 bg-gray-300 rounded-full mr-6"></div>
            <div>
              <h1 className="text-2xl font-bold">{profileUser?.name}</h1>
              <p className="text-gray-600">@{profileUser?.username || profileUser?.name?.toLowerCase()}</p>
              <p className="text-gray-500 mt-2">{profileUser?.email}</p>
            </div>
          </div>
          
          <div className="flex space-x-6 text-center">
            <div>
              <span className="block text-xl font-bold">125</span>
              <span className="text-gray-600">Posts</span>
            </div>
            <div>
              <span className="block text-xl font-bold">456</span>
              <span className="text-gray-600">Followers</span>
            </div>
            <div>
              <span className="block text-xl font-bold">789</span>
              <span className="text-gray-600">Following</span>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Bio</h2>
          <p className="text-gray-600 mb-6">
            {profileUser?.bio || 'No bio yet. Write something about yourself!'}
          </p>
          
          <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <p className="mb-2">Just started learning React! It's amazing! 💻</p>
              <p className="text-sm text-gray-500">Posted 1 day ago</p>
            </div>
            <div className="border-b pb-4">
              <p className="mb-2">Beautiful day for coding! ☀️</p>
              <p className="text-sm text-gray-500">Posted 3 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;