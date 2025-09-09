import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { CommentSkeleton, ListSkeleton } from './ui/Skeleton';
import { useToastNotifications } from './ui/Toast';

const Comments = ({ reviewId }) => {
  const { apiClient, user } = useContext(AuthContext);
  const { showSuccess, showError } = useToastNotifications();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [reviewId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/comments/review/${reviewId}`);
      setComments(response.data.comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/comments', {
        content: newComment,
        reviewId: parseInt(reviewId)
      });
      
      setComments(prev => [response.data, ...prev]);
      setNewComment('');
      showSuccess('Comment posted successfully!');
    } catch (error) {
      console.error('Error submitting comment:', error);
      showError(error.response?.data?.error || 'Failed to submit comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (e, parentId) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/comments', {
        content: replyContent,
        reviewId: parseInt(reviewId),
        parentId: parseInt(parentId)
      });
      
      // Find the parent comment and add the reply
      setComments(prev => prev.map(comment => 
        comment.id === parentId 
          ? { ...comment, replies: [...comment.replies, response.data] }
          : comment
      ));
      
      setReplyContent('');
      setReplyingTo(null);
      showSuccess('Reply posted successfully!');
    } catch (error) {
      console.error('Error submitting reply:', error);
      showError(error.response?.data?.error || 'Failed to submit reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const CommentItem = ({ comment, isReply = false }) => (
    <div className={`${isReply ? 'ml-8 mt-2' : 'mb-4'}`}>
      <div className="flex items-start space-x-3">
        <Link to={`/users/${comment.user.id}`}>
          <img
            src={comment.user.profilePicture || '/default-avatar.png'}
            alt={comment.user.name}
            className="w-8 h-8 rounded-full object-cover"
          />
        </Link>
        <div className="flex-1">
          <div className="bg-gray-100 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Link to={`/users/${comment.user.id}`} className="font-medium text-sm text-blue-600 hover:underline">{comment.user.username || comment.user.name}</Link>
              <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
            </div>
            <p className="text-sm text-gray-700">{comment.content}</p>
          </div>
          
          {!isReply && user && (
            <button
              onClick={() => setReplyingTo(comment.id)}
              className="text-xs text-blue-500 hover:text-blue-700 mt-1"
            >
              Reply
            </button>
          )}
          
          {replyingTo === comment.id && (
            <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="mt-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none"
                rows="2"
                required
              />
              <div className="flex space-x-2 mt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {isSubmitting ? 'Posting...' : 'Reply'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                  className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Comments</h3>
        <ListSkeleton count={3} ItemComponent={CommentSkeleton} />
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">Comments ({comments.length})</h3>
      
      {user && (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none"
            rows="3"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      )}
      
      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment.id}>
            <CommentItem comment={comment} />
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-8">
                {comment.replies.map(reply => (
                  <CommentItem key={reply.id} comment={reply} isReply />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {comments.length === 0 && (
        <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
      )}
    </div>
  );
};

export default Comments;
