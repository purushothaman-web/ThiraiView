import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FeedItemSkeleton, ListSkeleton } from './ui/Skeleton';

const UserFeed = () => {
  const { apiClient } = useContext(AuthContext);
  const [feed, setFeed] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchFeed();
  }, [page]);

  const fetchFeed = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/follow/feed?page=${page}&limit=10`);
      if (page === 1) {
        setFeed(response.data.feed);
      } else {
        setFeed(prev => [...prev, ...response.data.feed]);
      }
      setHasMore(response.data.feed.length === 10);
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getFullPosterUrl = (poster) => {
    if (!poster) return '/default-movie-poster.jpg';
    if (poster.startsWith('http')) return poster;
    return `http://localhost:3000${poster}`;
  };

  const FeedItem = ({ item }) => {
    if (item.type === 'movie') {
      const movie = item.data;
      return (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <img
              src={movie.user.profilePicture || '/default-avatar.png'}
              alt={movie.user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-medium">
                <Link to={`/profile/${movie.user.id}`} className="hover:text-blue-600">
                  {movie.user.username || movie.user.name}
                </Link>
                {' '}added a new movie
              </p>
              <p className="text-sm text-gray-500">{formatDate(item.createdAt)}</p>
            </div>
          </div>
          
          <Link to={`/movie/${movie.id}`} className="block group">
            <div className="flex space-x-4">
              <img
                src={getFullPosterUrl(movie.poster)}
                alt={movie.title}
                className="w-20 h-30 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                onError={(e) => {
                  e.target.src = '/default-movie-poster.jpg';
                }}
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold group-hover:text-blue-600">
                  {movie.title}
                </h3>
                <p className="text-gray-600">{movie.director} ({movie.year})</p>
                {movie.genre && (
                  <p className="text-sm text-gray-500 mt-1">Genre: {movie.genre}</p>
                )}
              </div>
            </div>
          </Link>
        </div>
      );
    }

    if (item.type === 'review') {
      const review = item.data;
      return (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <img
              src={review.user.profilePicture || '/default-avatar.png'}
              alt={review.user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-medium">
                <Link to={`/profile/${review.user.id}`} className="hover:text-blue-600">
                  {review.user.username || review.user.name}
                </Link>
                {' '}reviewed a movie
              </p>
              <p className="text-sm text-gray-500">{formatDate(item.createdAt)}</p>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Link to={`/movie/${review.movie.id}`} className="block group">
              <img
                src={getFullPosterUrl(review.movie.poster)}
                alt={review.movie.title}
                className="w-20 h-30 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                onError={(e) => {
                  e.target.src = '/default-movie-poster.jpg';
                }}
              />
            </Link>
            <div className="flex-1">
              <Link to={`/movie/${review.movie.id}`} className="block group">
                <h3 className="text-lg font-semibold group-hover:text-blue-600">
                  {review.movie.title}
                </h3>
              </Link>
              <div className="flex items-center space-x-2 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-lg ${
                        i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {review._count.reviewLikes} like{review._count.reviewLikes !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-gray-700 line-clamp-3">{review.content}</p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  if (isLoading && page === 1) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Your Feed</h1>
        <ListSkeleton count={5} ItemComponent={FeedItemSkeleton} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Your Feed</h1>
      
      {feed.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Your feed is empty</p>
          <p className="text-sm text-gray-400">
            Follow some users to see their movie additions and reviews here!
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {feed.map((item, index) => (
              <FeedItem key={`${item.type}-${item.data.id}-${index}`} item={item} />
            ))}
          </div>
          
          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserFeed;
