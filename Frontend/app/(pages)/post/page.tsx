"use client"
import { useState, useRef } from 'react';
import { 
  Image, 
  X, 
  Send, 
  Star,
  AlertCircle,
  CheckCircle,
  Upload,
  Camera
} from "lucide-react";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000';

interface User {
  id: string;
  username: string;
  avatarUrl?: string;
  isVerified: boolean;
  role: 'CELEBRITY' | 'PUBLIC';
}

interface CreatePostPageProps {
  user: User;
  onPostCreated?: (post: any) => void;
}

// Toast Component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`}>
      <div className="flex items-center gap-2">
        {type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 hover:opacity-70">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default function CreatePostPage({ user, onPostCreated }: CreatePostPageProps) {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxContentLength = 2000;
  const maxImageSize = 5 * 1024 * 1024; // 5MB

//   const isCelebrity = user.role === 'CELEBRITY';
const isCelebrity =  'CELEBRITY';

  // Show toast message
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxImageSize) {
      showToast('Image size must be less than 5MB', 'error');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }

    setSelectedImage(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove selected image
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Upload image to server
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          if (response.success) {
            resolve(response.data.imageUrl);
          } else {
            reject(new Error(response.message || 'Upload failed'));
          }
        } else {
          reject(new Error('Upload failed'));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', `${BACKEND_API_URL}/uploadImage`);
      xhr.send(formData);
    });
  };

  // Create post
  const handleCreatePost = async () => {
    if (!content.trim()) {
      showToast('Please write some content for your post', 'error');
      return;
    }

    if (!isCelebrity) {
      showToast('Only celebrities can create posts', 'error');
      return;
    }

    setIsCreating(true);

    try {
      let imageUrl = null;
      
      if (selectedImage) {
        setIsUploading(true);
        imageUrl = await uploadImage(selectedImage);
        setIsUploading(false);
      }

      const response = await fetch(`${BACKEND_API_URL}/createPost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          content: content.trim(),
          imageUrl
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        showToast('Successfully posted!', 'success');
        
        // Reset form
        setContent('');
        setSelectedImage(null);
        setImagePreview(null);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        if (onPostCreated) {
          onPostCreated(data.data.post);
        }
        
      } else {
        throw new Error(data.message || 'Failed to create post');
      }

    } catch (err) {
      console.error('Error creating post:', err);
      showToast(err instanceof Error ? err.message : 'Failed to create post', 'error');
    } finally {
      setIsCreating(false);
      setIsUploading(false);
    }
  };

  const remainingChars = maxContentLength - content.length;
  const isContentValid = content.trim().length > 0 && remainingChars >= 0;

  if (!isCelebrity) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md text-center p-12">
          <AlertCircle size={64} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            Celebrity Access Only
          </h2>
          <p className="text-gray-500">
            Only verified celebrities can create posts. 
            {user.role === 'PUBLIC' && ' Apply for celebrity verification to start posting.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Toast */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Create New Post
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Share your thoughts with your followers
        </p>
      </div>

      {/* Create Post Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
        {/* <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{user.username}</span>
                {user.isVerified && (
                  <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Star size={12} />
                    Verified
                  </div>
                )}
              </div>
              <span className="text-sm text-gray-500">Creating a new post</span>
            </div>
          </div>
        </div> */}

        <div className="p-4 space-y-4">
          {/* Image Upload Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Image size={18} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Add Image (Optional)
              </span>
            </div>
            
            {!imagePreview ? (
              <div 
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-purple-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={32} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500 mb-1">
                  Click to upload an image
                </p>
                <p className="text-xs text-gray-400">
                  PNG, JPG, GIF up to 5MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-64 object-cover rounded-lg"
                />
                <button
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  onClick={removeImage}
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Text Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                What's on your mind?
              </label>
              <span className={`text-xs ${remainingChars < 100 ? 'text-red-500' : 'text-gray-500'}`}>
                {remainingChars} characters remaining
              </span>
            </div>
            
            <textarea
              placeholder="Share your thoughts, updates, or anything you'd like your followers to see..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Upload size={16} />
                <span>Uploading image...</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {selectedImage && (
                <span className="flex items-center gap-1">
                  <Image size={14} />
                  Image attached
                </span>
              )}
            </div>
            
            <button
              onClick={handleCreatePost}
              disabled={!isContentValid || isCreating || isUploading}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {!isCreating && !isUploading && <Send size={18} />}
              {isCreating ? 'Publishing...' : isUploading ? 'Uploading...' : 'Publish Post'}
            </button>
          </div>
        </div>
      </div>

      {/* Guidelines */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
          Posting Guidelines
        </h3>
        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <li>• Keep content respectful and appropriate</li>
          <li>• Image uploads are limited to 5MB</li>
          <li>• Posts cannot exceed {maxContentLength.toLocaleString()} characters</li>
          <li>• Only verified celebrities can create posts</li>
        </ul>
      </div>
    </div>
  );
}