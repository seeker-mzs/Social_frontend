import React from 'react';
import { Link } from 'react-router-dom';

const UserLink = ({ user, showAvatar = true, showUsername = true }) => {
  if (!user) return null;

  return (
    <Link 
      to={`/profile/${user.username}`}
      className="flex items-center space-x-2 hover:text-blue-600 transition-colors"
      onClick={(e) => e.stopPropagation()} // Prevent event bubbling
    >
      {showAvatar && (
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
          {user.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      )}
      <div className="min-w-0">
        <div className="font-medium text-sm truncate">{user.name}</div>
        {showUsername && (
          <div className="text-xs text-gray-500 truncate">@{user.username}</div>
        )}
      </div>
    </Link>
  );
};

export default UserLink;