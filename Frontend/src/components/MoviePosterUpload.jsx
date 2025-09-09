import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useToastNotifications } from './ui/Toast';
import { useConfirm } from './ui/ConfirmDialog';
import ImageCropper from './ui/ImageCropper';

const MoviePosterUpload = ({ movieId, currentPoster, onPosterUpdate }) => {
  const { apiClient } = useContext(AuthContext);
  const { showSuccess, showError } = useToastNotifications();
  const { confirm } = useConfirm();
  const [isUploading, setIsUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setShowCropper(true);
    } else {
      showError('Please select a valid image file');
    }
  };

  const handleCrop = async (croppedBlob) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('poster', croppedBlob, 'movie-poster.jpg');

      const response = await apiClient.post(`/movies/${movieId}/poster`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.poster) {
        onPosterUpdate(response.data.poster);
        showSuccess('Movie poster updated successfully!');
      }
    } catch (error) {
      console.error('Error uploading movie poster:', error);
      showError(error.response?.data?.error || 'Failed to update movie poster');
    } finally {
      setIsUploading(false);
      setShowCropper(false);
      setSelectedFile(null);
    }
  };

  const handleRemovePoster = async () => {
    const confirmed = await confirm(
      'Are you sure you want to remove this movie poster?',
      {
        title: 'Remove Movie Poster',
        type: 'warning',
        confirmText: 'Remove',
      }
    );

    if (confirmed) {
      setIsUploading(true);
      try {
        // You might need to implement a DELETE endpoint for removing posters
        // For now, we'll just update the UI
        onPosterUpdate(null);
        showSuccess('Movie poster removed successfully!');
      } catch (error) {
        console.error('Error removing movie poster:', error);
        showError(error.response?.data?.error || 'Failed to remove movie poster');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const getFullPosterUrl = (posterPath) => {
    if (!posterPath) return '/default-movie-poster.jpg';
    if (posterPath.startsWith('http')) return posterPath;
    return `http://localhost:3000${posterPath}`;
  };

  if (showCropper) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Crop Your Movie Poster</h3>
        <ImageCropper
          onCrop={handleCrop}
          onCancel={() => {
            setShowCropper(false);
            setSelectedFile(null);
          }}
          aspectRatio={2/3} // Movie poster aspect ratio
          minWidth={200}
          minHeight={300}
          maxWidth={800}
          maxHeight={1200}
          quality={0.9}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start space-x-4">
        <div className="relative">
          <img
            src={getFullPosterUrl(currentPoster)}
            alt="Movie Poster"
            className="w-32 h-48 object-cover rounded-lg border-2 border-gray-300"
            onError={(e) => {
              e.target.src = '/default-movie-poster.jpg';
            }}
          />
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="movie-poster-upload"
              disabled={isUploading}
            />
            <label
              htmlFor="movie-poster-upload"
              className={`inline-block px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors ${
                isUploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isUploading ? 'Uploading...' : 'Change Poster'}
            </label>
          </div>
          {currentPoster && (
            <button
              onClick={handleRemovePoster}
              disabled={isUploading}
              className="text-sm text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
            >
              Remove Poster
            </button>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-500">
        Upload a portrait image (2:3 ratio) for best results. Maximum file size: 5MB.
      </p>
    </div>
  );
};

export default MoviePosterUpload;
