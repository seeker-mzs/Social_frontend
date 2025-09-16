import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import UserLink from './UserLink';

const Comment = ({ comment, postId, depth = 0, onCommentAdded, allComments = [] }) => {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replying, setReplying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Maximum nesting depth to avoid infinite recursion
  const maxDepth = 5;
  const shouldNest = depth < maxDepth;

  // FIXED: Use comment.replies directly (backend already provides nested structure)
  const replies = comment.replies || [];

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !user) return;

    setReplying(true);
    try {
      await api.post(`/posts/${postId}/comments`, {
        content: replyContent,
        parent_id: comment.id
      });

      setReplyContent('');
      setShowReplyForm(false);
      
      // Notify parent component to refresh comments
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      alert('Failed to post reply');
    } finally {
      setReplying(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    setIsDeleting(true);
    try {
      await api.delete(`/comments/${comment.id}`);
      // Notify parent component to refresh comments
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`${depth > 0 ? 'ml-6 pl-4 border-l-2 border-gray-100' : ''} mb-3`}>
      {/* Comment Content */}
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center">
          {comment.user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          {/* Comment Header with Clickable User Link */}
          <div className="flex items-center space-x-2 mb-1">
            <UserLink 
              user={comment.user} 
              showAvatar={false} 
              showUsername={false}
            />
            <span className="text-xs text-gray-500">
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
          </div>
          
          {/* Comment Text */}
          <p className="text-gray-800 text-sm mb-2">{comment.content}</p>
          
          {/* Comment Actions */}
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            {user && shouldNest && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="hover:text-blue-600 font-medium"
                disabled={replying}
              >
                Reply
              </button>
            )}
            
            {user && user.id === comment.user_id && (
              <button
                onClick={handleDelete}
                className="hover:text-red-600 font-medium"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && shouldNest && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <form onSubmit={handleReply}>
                <textarea
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
                  rows="2"
                  disabled={replying}
                />
                <div className="flex space-x-2 mt-2">
                  <button
                    type="submit"
                    disabled={!replyContent.trim() || replying}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {replying ? 'Posting...' : 'Post Reply'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReplyForm(false)}
                    className="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {replies.length > 0 && shouldNest && (
        <div className="mt-3">
          {replies.map((reply) => (
            <Comment 
              key={reply.id} 
              comment={reply} 
              postId={postId}
              depth={depth + 1}
              onCommentAdded={onCommentAdded}
              allComments={allComments}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;