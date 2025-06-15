'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Badge } from "@heroui/badge";
import { Heart, MessageCircle, Share } from "lucide-react";
import Image from 'next/image';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000';

interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  likesCount: number;
  createdAt: string;
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
    isVerified: boolean;
    role: 'CELEBRITY' | 'PUBLIC';
  };
}

interface PostsFeedProps {
  userId?: string;
}

export default function PostsFeed({ userId }: PostsFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const observer = useRef<IntersectionObserver>();
  const lastPostElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePosts();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const loadPosts = async (isInitial = false) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      params.append('limit', '10');
      
      if (cursor && !isInitial) {
        params.append('cursor', cursor);
      } else {
        params.append('page', '1');
      }
      
      // Always use /getAll endpoint for universal public feed
      const endpoint = '/getAll';
      const url = `${BACKEND_API_URL}${endpoint}?${params.toString()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const newPosts = data.data.posts;
        
        if (isInitial) {
          setPosts(newPosts);
        } else {
          setPosts(prev => [...prev, ...newPosts]);
        }
        
        setHasMore(data.data.pagination.hasMore);
        setCursor(data.data.pagination.nextCursor);
      } else {
        throw new Error(data.message || 'Failed to load posts');
      }
      
    } catch (err) {
      console.error('Error loading posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = useCallback(() => {
    if (hasMore && !loading) {
      loadPosts(false);
    }
  }, [hasMore, loading, cursor]);

  // Initial load
  useEffect(() => {
    loadPosts(true);
  }, [userId]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <Button 
          color="primary" 
          onClick={() => {
            setError(null);
            setPosts([]);
            setCursor(null);
            setHasMore(true);
            loadPosts(true);
          }}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (posts.length === 0 && loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (posts.length === 0 && !loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No posts available yet. Check back later for celebrity updates!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Posts List */}
      {posts.map((post, index) => (
        <Card 
          key={post.id} 
          className="w-full"
          ref={index === posts.length - 1 ? lastPostElementRef : null}
        >
          <CardHeader className="flex gap-3">
            <Avatar
              src={post.author.avatarUrl}
              name={post.author.username}
              size="md"
            />
            <div className="flex flex-col flex-1">
              <div className="flex items-center gap-2">
                <p className="text-md font-semibold">{post.author.username}</p>
                {post.author.isVerified && (
                  <Badge color="primary" variant="flat" size="sm">
                    ✓ Verified
                  </Badge>
                )}
                {post.author.role === 'CELEBRITY' && (
                  <Badge color="warning" variant="flat" size="sm">
                    Celebrity
                  </Badge>
                )}
              </div>
              <p className="text-small text-default-500">
                {formatTimeAgo(post.createdAt)}
              </p>
            </div>
          </CardHeader>
          
          <CardBody className="px-3 py-0 text-small text-default-600">
            <p className="mb-4">{post.content}</p>
            
            {post.imageUrl && (
              <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden">
                <Image
                  src={post.imageUrl}
                  alt="Post image"
                  fill
                  className="object-cover"
                  loading="lazy"
                />
              </div>
            )}
          </CardBody>
          
          <CardFooter className="gap-3">
            <div className="flex gap-1 items-center">
              <Button
                variant="light"
                size="sm"
                startContent={<Heart size={16} />}
              >
                {post.likesCount}
              </Button>
            </div>
            <div className="flex gap-1">
              <Button
                variant="light"
                size="sm"
                startContent={<MessageCircle size={16} />}
              >
                Comment
              </Button>
            </div>
            <div className="flex gap-1">
              <Button
                variant="light"
                size="sm"
                startContent={<Share size={16} />}
              >
                Share
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
      
      {/* Loading indicator for lazy loading */}
      {loading && (
        <div className="flex justify-center py-4">
          <Spinner size="md" />
        </div>
      )}
      
      {/* End of posts indicator */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-4">
          <p className="text-gray-500">You've reached the end!</p>
        </div>
      )}
    </div>
  );
}
