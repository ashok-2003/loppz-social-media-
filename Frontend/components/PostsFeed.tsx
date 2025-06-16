'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";

import { Heart, VerifiedIcon } from "lucide-react";
import Image from 'next/image';


//types of post from type/index.ts
import { Post } from '@/types';
import { User } from '@heroui/user';

interface PostsFeedProps {
  url: string
}

export default function PostsFeed({ url }: PostsFeedProps) {

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);


  // to load the content based on observer 
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
      }


      const newUrl = `${url}?${params.toString()}`;
      const response = await fetch(newUrl); // fetch the data from the backend

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const newPosts = data.data.posts;
        setPosts(prev => [...prev, ...newPosts]);

        // varialbe comming from backend gives hasmore and next cursor to fetch 
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
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    // const now = new Date();
    // const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // if (diffInSeconds < 60) return 'Just now';
    // if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    // if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    // return `${Math.floor(diffInSeconds / 86400)}d ago`;

    const month = date.getMonth();
    const day = date.getDate();
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="mb-4 text-red-500">Error: {error}</p>
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

  return (
    <div className="space-y-6">
      {posts.map((post, index) => (
        <Card
          key={post.id}
          className="w-full"
          ref={index === posts.length - 1 ? lastPostElementRef : null}
        >
          <CardHeader className="flex gap-3">
            <div className="flex flex-row gap-2">
              <User
                description="Celebrity"
                name={post.author.username}
              />
              {post.author.isVerified && (
                <VerifiedIcon size={16} className='text-blue-600' />
              )}
            </div>
          </CardHeader>

          <CardBody className="px-3 py-2 text-small text-default-600">
            {post.imageUrl && (
              <div className="relative w-full h-64 mb-4 overflow-hidden rounded-lg">
                <Image
                  src={post.imageUrl}
                  alt="Post image"
                  fill
                  className="object-cover"
                  loading="lazy"
                />
              </div>
            )}
            <p className="font-semibold text-md">{post.content}</p>
          </CardBody>

          <CardFooter className="flex gap-3 mt-2 border-t-1 border-foreground-200">
            <div className="font-sans text-blue-600 text-tiny">
              <p>
                last update: {formatTimeAgo(post.updatedAt)}
              </p>
            </div>
            <div>
              <Button
                variant="light"
                size="sm"
                startContent={<Heart size={16} />}
              >
                {post.likesCount}
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
        <div className="py-4 text-center">
          <p className="text-gray-500">You've reached the end!</p>
        </div>
      )}
    </div>
  );
}
