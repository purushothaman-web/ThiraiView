import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useToastNotifications } from './ui/Toast';
import { useConfirm } from './ui/ConfirmDialog';
import ImageCropper from './ui/ImageCropper';

const ProfileImageUpload = ({ currentImage, onImageUpdate }) => {
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
      formData.append('profilePicture', croppedBlob, 'profile-picture.jpg');

      const response = await apiClient.put('/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.user) {
        onImageUpdate(response.data.user.profilePicture);
        showSuccess('Profile picture updated successfully!');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      showError(error.response?.data?.error || 'Failed to update profile picture');
    } finally {
      setIsUploading(false);
      setShowCropper(false);
      setSelectedFile(null);
    }
  };

  const handleRemoveImage = async () => {
    const confirmed = await confirm(
      'Are you sure you want to remove your profile picture?',
      {
        title: 'Remove Profile Picture',
        type: 'warning',
        confirmText: 'Remove',
      }
    );

    if (confirmed) {
      setIsUploading(true);
      try {
        const response = await apiClient.put('/profile', {
          removeProfilePicture: true,
        });

        if (response.data.user) {
          onImageUpdate(null);
          showSuccess('Profile picture removed successfully!');
        }
      } catch (error) {
        console.error('Error removing profile picture:', error);
        showError(error.response?.data?.error || 'Failed to remove profile picture');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return '/default-avatar.png';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:3000${imagePath}`;
  };

  if (showCropper) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Crop Your Profile Picture</h3>
        <ImageCropper
          onCrop={handleCrop}
          onCancel={() => {
            setShowCropper(false);
            setSelectedFile(null);
          }}
          aspectRatio={1}
          minWidth={100}
          minHeight={100}
          maxWidth={500}
          maxHeight={500}
          quality={0.9}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={getFullImageUrl(currentImage)}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
            onError={(e) => {
              e.target.src = '/default-avatar.png';
            }}
          />
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
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
              id="profile-image-upload"
              disabled={isUploading}
            />
            <label
              htmlFor="profile-image-upload"
              className={`inline-block px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors ${
                isUploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isUploading ? 'Uploading...' : 'Change Picture'}
            </label>
          </div>
          {currentImage && (
            <button
              onClick={handleRemoveImage}
              disabled={isUploading}
              className="text-sm text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
            >
              Remove Picture
            </button>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-500">
        Upload a square image for best results. Maximum file size: 3MB.
      </p>
    </div>
  );
};

export default ProfileImageUpload;
