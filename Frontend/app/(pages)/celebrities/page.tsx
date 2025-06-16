"use client"
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Badge } from "@heroui/badge";
import {
  Users,
  UserPlus,
  UserCheck,
  Star,
  VerifiedIcon
} from "lucide-react";
import { LoginWarn } from '@/components/loginWarn';
import { User } from '@heroui/user';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000';

interface Celebrity {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  isVerified: boolean;
  role: 'CELEBRITY';
  createdAt: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowed?: boolean;
}

export default function CelebrityPage() {
  // All hooks must be called at the top level, before any early returns
  const { data: session, status } = useSession();
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followingInProgress, setFollowingInProgress] = useState<Set<string>>(new Set());
  const [followedCelebrityIds, setFollowedCelebrityIds] = useState<Set<string>>(new Set());

  const userId = session?.user?.id;

  // Fetch all celebrities
  const fetchCelebrities = async () => {
    try {
      const response = await fetch(`${BACKEND_API_URL}/getCelebrities`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        return data.data.celebrities;
      } else {
        throw new Error(data.message || 'Failed to fetch celebrities');
      }

    } catch (err) {
      console.error('Error fetching celebrities:', err);
      throw err;
    }
  };

  // Fetch user's following list
  const fetchUserFollowing = async (): Promise<Set<string>> => {
    if (!userId) return new Set<string>();

    try {
      const response = await fetch(`${BACKEND_API_URL}/getUserFollowing/${userId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        return new Set<string>(data.data.followedCelebrityIds as string[]);
      } else {
        throw new Error(data.message || 'Failed to fetch user following');
      }

    } catch (err) {
      console.error('Error fetching user following:', err);
      return new Set<string>();
    }
  };

  // Load all data
  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch celebrities and user following in parallel
      const [celebritiesData, followingSet] = await Promise.all([
        fetchCelebrities(),
        fetchUserFollowing()
      ]);

      setFollowedCelebrityIds(followingSet);

      // Add isFollowed property to celebrities
      const celebritiesWithFollowStatus = celebritiesData.map((celebrity: Celebrity) => ({
        ...celebrity,
        isFollowed: followingSet.has(celebrity.id)
      }));

      setCelebrities(celebritiesWithFollowStatus);

    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Handle follow/unfollow
  const handleFollowToggle = async (celebrityId: string) => {
    if (!userId) {
      alert('Please login to follow celebrities');
      return;
    }

    setFollowingInProgress(prev => new Set(prev).add(celebrityId));

    try {
      const response = await fetch(`${BACKEND_API_URL}/followCelebrity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          celebrityId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle follow status');
      }

      const data = await response.json();

      if (data.success) {
        // Update the celebrity's follow status and follower count
        setCelebrities(prev => prev.map(celeb =>
          celeb.id === celebrityId
            ? {
              ...celeb,
              isFollowed: data.data.isFollowing,
              followersCount: data.data.followerCount
            }
            : celeb
        ));

        // Update the followed celebrity IDs set
        setFollowedCelebrityIds(prev => {
          const newSet = new Set(prev);
          if (data.data.isFollowing) {
            newSet.add(celebrityId);
          } else {
            newSet.delete(celebrityId);
          }
          return newSet;
        });
      }

    } catch (err) {
      console.error('Error toggling follow:', err);
      alert('Failed to update follow status');
    } finally {
      setFollowingInProgress(prev => {
        const newSet = new Set(prev);
        newSet.delete(celebrityId);
        return newSet;
      });
    }
  };

  // Format numbers (1000 -> 1K)
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Initial load - this useEffect must be called after all useState hooks
  useEffect(() => {
    if (status === 'authenticated' && userId) {
      loadData();
    }
  }, [userId, status]);

  // Handle different session states AFTER all hooks are called
  if (status === "loading") {
    return (
      <div className="flex justify-center py-12">
        <div className="text-center">
          <Spinner size="lg" className="mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    return <LoginWarn />;
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 text-red-500">
          <Users size={64} className="mx-auto mb-4 opacity-50" />
          <h2 className="mb-2 text-xl font-semibold">Error Loading Celebrities</h2>
          <p>{error}</p>
        </div>
        <Button color="primary" onPress={loadData}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">
          Celebrities
        </h1>
        <p className="mb-6 text-lg text-gray-600 dark:text-gray-400">
          Discover and follow your favorite celebrities
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <Spinner size="lg" className="mb-4" />
            <p className="text-gray-500">Loading celebrities...</p>
          </div>
        </div>
      )}

      {/* Celebrities Grid */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {celebrities.map((celebrity) => (
              <Card key={celebrity.id} className="transition-shadow hover:shadow-lg">
                <CardHeader className="flex gap-3">
                  <div className="flex flex-row gap-2">
                    <User
                      description="Celebrity"
                      name={celebrity.username}
                    />
                    {celebrity.isVerified && (
                      <VerifiedIcon size={16} className='text-blue-600' />
                    )}
                  </div>
                </CardHeader>

                <CardBody className="pt-0 pb-2">
                  <div className="grid grid-cols-3 gap-4 text-sm text-center">
                    <div>
                      <div className="font-semibold text-blue-600">
                        {formatNumber(celebrity.followersCount)}
                      </div>
                      <div className="text-gray-500">Followers</div>
                    </div>
                    <div>
                      <div className="font-semibold text-purple-600">
                        {formatNumber(celebrity.postsCount)}
                      </div>
                      <div className="text-gray-500">Posts</div>
                    </div>
                  </div>
                </CardBody>

                <CardFooter className="pt-2">
                  {userId ? (
                    <Button
                      color={celebrity.isFollowed ? "default" : "primary"}
                      variant={celebrity.isFollowed ? "bordered" : "solid"}
                      size="md"
                      className="w-full"
                      startContent={
                        followingInProgress.has(celebrity.id) ? (
                          <Spinner size="sm" />
                        ) : celebrity.isFollowed ? (
                          <UserCheck size={16} />
                        ) : (
                          <UserPlus size={16} />
                        )
                      }
                      onPress={() => handleFollowToggle(celebrity.id)}
                      disabled={followingInProgress.has(celebrity.id)}
                    >
                      {celebrity.isFollowed ? 'Following' : 'Follow'}
                    </Button>
                  ) : (
                    <Button
                      color="primary"
                      variant="bordered"
                      size="md"
                      className="w-full"
                      disabled
                    >
                      Login to Follow
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}