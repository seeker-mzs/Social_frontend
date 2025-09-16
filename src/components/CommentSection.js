import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api'; // Changed from axios to api
import Comment from './Comment';

const CommentSection = ({ postId, isOpen, onCommentAdded }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  // Fetch comments function
  const fetchComments = useCallback(async () => {
    if (!postId) return;
    
    setFetching(true);
    try {
      const response = await api.get(`/posts/${postId}/comments`); // Changed to api
      // FIXED: Use response.data directly (backend already nests comments)
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments');
    } finally {
      setFetching(false);
    }
  }, [postId]);

  // Fetch comments when the section is opened
  useEffect(() => {
    if (isOpen && postId) {
      fetchComments();
    }
  }, [isOpen, postId, fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setLoading(true);
    setError('');

    try {
      const response = await api.post(`/posts/${postId}/comments`, { // Changed to api
        content: newComment
      });

      // Add the new comment to the list
      setComments([response.data, ...comments]);
      setNewComment(''); // Clear the input
      
      // Notify parent component (Feed) that a comment was added
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error) {
      setError('Failed to post comment');
      console.error('Error posting comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentAdded = () => {
    // Refresh comments when a reply is added or comment is deleted
    fetchComments();
  };

  if (!isOpen) return null;

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <h4 className="font-semibold mb-3">Comments</h4>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      {/* Comment form for top-level comments */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-sm"
            rows="3"
            disabled={loading}
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={!newComment.trim() || loading}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-gray-500 text-sm mb-4">Please log in to comment.</p>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {fetching ? (
          <p className="text-gray-500 text-sm text-center py-4">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No comments yet. Be the first to comment!</p>
        ) : (
          comments
            .filter(comment => !comment.parent_id) // Only show top-level comments
            .map((comment) => (
              <Comment 
                key={comment.id} 
                comment={comment} 
                postId={postId}
                onCommentAdded={handleCommentAdded}
                allComments={comments} // Pass all comments for nesting
              />
            ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;