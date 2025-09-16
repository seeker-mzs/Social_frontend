import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserLink from './UserLink';
import FollowButton from './FollowButton';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/users'); // You'll need to create this endpoint
      setUsers(response.data);
    } catch (error) {
      setError('Failed to load users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-8">Loading users...</div>;
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Discover Users</h1>
        <div className="space-y-3">
          {users.map(user => (
            <div key={user.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
              <UserLink user={user} />
              <FollowButton userId={user.id} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Users;