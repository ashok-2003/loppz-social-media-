"use client"
import { useState, useRef } from 'react';
import { 
  Image, 
  X, 
  Send, 
  Star,
  AlertCircle,
  Camera
} from "lucide-react";
import { useSession } from 'next-auth/react';
import { Textarea } from '@heroui/input';
import { addToast } from '@heroui/toast';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';

const BACKEND_API_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL;;

export default function CreatePostPage() {
  const { data: session, status } = useSession();
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxContentLength = 2000;
  const maxImageSize = 5 * 1024 * 1024; // 5MB

  // Check if user is celebrity
  const isCelebrity = session?.user?.role === 'CELEBRITY';
  const user = session?.user;

  // Show toast message using HeroUI
  const showToast = (title: string, description: string, color: 'success' | 'danger' = 'success') => {
    addToast({
      title,
      description,
      color,
    });
  };

  // Handle image selection (frontend only for now)
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Invalid File', 'Please select a valid image file', 'danger');
      return;
    }

    if (file.size > maxImageSize) {
      showToast('File Too Large', 'Please select an image smaller than 5MB', 'danger');
      return;
    }

    setSelectedImage(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Create post (text only for now)
  const handleCreatePost = async () => {
    if (!content.trim()) {
      showToast('Content Required', 'Please write some content for your post', 'danger');
      return;
    }

    if (!isCelebrity) {
      showToast('Access Denied', 'Only celebrities can create posts', 'danger');
      return;
    }

    setIsCreating(true);

    try {
      // Only sending text content for now
      // Image upload logic will be added later
      const response = await fetch(`${BACKEND_API_URL}/createPost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          content: content.trim(),
          // imageUrl will be added later when backend supports it
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        showToast('Success!', 'Your post has been published successfully', 'success');
        
        // Reset form
        setContent('');
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
      } else {
        throw new Error(data.message || 'Failed to create post');
      }

    } catch (err) {
      console.error('Error creating post:', err);
      showToast('Error', err instanceof Error ? err.message : 'Failed to create post', 'danger');
    } finally {
      setIsCreating(false);
    }
  };

  const remainingChars = maxContentLength - content.length;
  const isContentValid = content.trim().length > 0 && remainingChars >= 0;

  // Loading state
  if (status === 'loading') {
    return (
      <div className="max-w-2xl p-6 mx-auto">
        <Card>
          <CardBody className="p-12 text-center">
            <div className="w-8 h-8 mx-auto mb-4 border-b-2 rounded-full animate-spin border-foreground"></div>
            <p className="text-foreground/70">Loading...</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="max-w-2xl p-6 mx-auto">
        <Card>
          <CardBody className="p-12 text-center">
            <AlertCircle size={64} className="mx-auto mb-4 text-foreground/50" />
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              Authentication Required
            </h2>
            <p className="text-foreground/70">
              Please sign in to create posts.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Not a celebrity
  if (!isCelebrity) {
    return (
      <div className="max-w-2xl p-6 mx-auto">
        <Card>
          <CardBody className="p-12 text-center">
            <AlertCircle size={64} className="mx-auto mb-4 text-foreground/50" />
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              Celebrity Access Only
            </h2>
            <p className="text-foreground/70">
              Only verified celebrities can create posts.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl p-6 mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold text-transparent bg-gradient-to-r from-primary to-secondary bg-clip-text">
          Create New Post
        </h1>
        <p className="text-foreground/70">
          Share your thoughts with your followers
        </p>
      </div>

      {/* Create Post Form */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{user?.name || user?.username}</span>
                {user?.isVerified && (
                  <div className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-primary/20 text-primary">
                    <Star size={12} />
                    Verified
                  </div>
                )}
              </div>
              <span className="text-sm text-foreground/70">Creating a new post</span>
            </div>
          </div>
        </CardHeader>

        <CardBody className="space-y-4">
          {/* Image Upload Section - Frontend only for now */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Image size={18} className="text-foreground/70" />
              <span className="text-sm font-medium text-foreground">
                Add Image (Coming Soon)
              </span>
            </div>
            
            {!imagePreview ? (
              <div 
                className="p-6 text-center transition-colors border-2 border-dashed rounded-lg cursor-pointer border-foreground/30 hover:border-primary"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={32} className="mx-auto mb-2 text-foreground/50" />
                <p className="mb-1 text-sm text-foreground/70">
                  Click to select an image (preview only)
                </p>
                <p className="text-xs text-foreground/50">
                  PNG, JPG, GIF up to 5MB - Upload feature coming soon
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
                  className="object-cover w-full rounded-lg max-h-64"
                />
                <Button
                  isIconOnly
                  size="sm"
                  color="danger"
                  className="absolute top-2 right-2"
                  onPress={removeImage}
                >
                  <X size={16} />
                </Button>
                <div className="absolute px-2 py-1 text-xs rounded bottom-2 left-2 bg-warning/90 text-warning-foreground">
                  Preview only - Upload coming soon
                </div>
              </div>
            )}
          </div>

          {/* Text Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">
                What's on your mind?
              </label>
              <span className={`text-xs ${remainingChars < 100 ? 'text-danger' : 'text-foreground/50'}`}>
                {remainingChars} characters remaining
              </span>
            </div>
            
            <Textarea
              placeholder="Share your thoughts, updates, or anything you'd like your followers to see..."
              value={content}
              onChange={(e: any) => setContent(e.target.value)}
              minRows={4}
              maxRows={6}
              maxLength={maxContentLength}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-foreground/20">
            <div className="text-sm text-foreground/70">
              {selectedImage && (
                <span className="flex items-center gap-1 text-warning">
                  <Image size={14} />
                  Image selected (preview only)
                </span>
              )}
            </div>
            
            <Button
              color="primary"
              onPress={handleCreatePost}
              isDisabled={!isContentValid || isCreating}
              isLoading={isCreating}
              startContent={!isCreating ? <Send size={18} /> : undefined}
            >
              {isCreating ? 'Publishing...' : 'Publish Post'}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}