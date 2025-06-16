"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { Button } from "@heroui/button";
import { useSession } from "next-auth/react";
import { ArrowLeft, Calendar, Heart, MessageCircle, Share } from "lucide-react";
import { useRouter } from "next/navigation";

interface Post {
  id: string;
  content: string;
  mediaUrl?: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
    isVerified: boolean;
    role: string;
  };
}

interface Celebrity {
  id: string;
  username: string;
  avatarUrl?: string;
  isVerified: boolean;
}

interface ViewPostsResponse {
  success: boolean;
  message?: string;
  data?: {
    celebrity: Celebrity;
    posts: Post[];
  };
}

const ViewPostsPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [celebrity, setCelebrity] = useState<Celebrity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!session?.user?.id) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        const response = await fetch(`${backendUrl}/getPostsByCelebrity/${session.user.id}`);
        
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        
        const data: ViewPostsResponse = await response.json();

        if (data.success) {
          setCelebrity(data.data?.celebrity ?? null);
          setPosts(data.data?.posts ?? []);
        } else {
          setError(data.message || 'Failed to fetch posts');
        }
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Cannot connect to server. Please check if backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [session?.user?.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" label="Loading your posts..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg text-danger">{error}</p>
        <Button color="primary" onPress={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl p-4 mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button isIconOnly variant="light" onPress={() => router.back()}>
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold">My Posts</h1>
      </div>

      {/* Celebrity Info */}
      {celebrity && (
        <Card className="mb-6">
          <CardBody>
            <div className="flex items-center gap-4">
              <Avatar size="lg" src={celebrity.avatarUrl} showFallback />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">{celebrity.username}</h2>
                  {celebrity.isVerified && (
                    <Chip size="sm" color="primary" variant="flat">
                      Verified
                    </Chip>
                  )}
                </div>
                <p className="text-small text-default-500">
                  Total Posts: {posts.length}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Posts List */}
      {posts.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center">
            <p className="text-lg text-default-500">No posts yet</p>
            <p className="mt-2 text-small text-default-400">
              Start sharing your content with your audience!
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="w-full">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <Avatar size="sm" src={post.author.avatarUrl} showFallback />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-small">
                        {post.author.username}
                      </p>
                      {post.author.isVerified && (
                        <Chip size="sm" color="primary" variant="flat">
                          ✓
                        </Chip>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-tiny text-default-400">
                      <Calendar size={12} />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardBody className="pt-0">
                <p className="mb-3 text-default-700">{post.content}</p>
                
                {post.mediaUrl && (
                  <div className="mb-3">
                    <img
                      src={post.mediaUrl}
                      alt="Post media"
                      className="object-cover w-full rounded-lg max-h-96"
                    />
                  </div>
                )}

                <div className="flex items-center gap-6 pt-2 border-t border-default-200">
                  <Button
                    variant="light"
                    size="sm"
                    startContent={<Heart size={16} />}
                    className="text-default-500"
                  >
                    Like
                  </Button>
                  <Button
                    variant="light"
                    size="sm"
                    startContent={<MessageCircle size={16} />}
                    className="text-default-500"
                  >
                    Comment
                  </Button>
                  <Button
                    variant="light"
                    size="sm"
                    startContent={<Share size={16} />}
                    className="text-default-500"
                  >
                    Share
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewPostsPage;