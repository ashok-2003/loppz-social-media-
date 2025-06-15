"use client"
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { Badge } from "@heroui/badge";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Tabs, Tab } from "@heroui/tabs";
import { Chip } from "@heroui/chip";
import { 
  Search, 
  Users, 
  Heart, 
  MessageSquare, 
  Star, 
  TrendingUp,
  Filter,
  UserPlus,
  UserCheck,
  Calendar,
  Award,
  Film,
  Music,
  Trophy,
  Camera
} from "lucide-react";

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

interface CelebrityPageProps {
  userId?: string; // Current logged in user ID
}

const CelebrityCategories = {
  all: { label: "All Celebrities", icon: Users },
  actors: { label: "Actors & Actresses", icon: Film },
  musicians: { label: "Musicians", icon: Music },
  athletes: { label: "Athletes", icon: Trophy },
  influencers: { label: "Influencers", icon: Camera },
  verified: { label: "Verified Only", icon: Award }
};

export default function CelebrityPage({ userId }: CelebrityPageProps) {
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [filteredCelebrities, setFilteredCelebrities] = useState<Celebrity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('followers');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('all');
  const [followingInProgress, setFollowingInProgress] = useState<Set<string>>(new Set());

  // Fetch all celebrities (no lazy loading)
  const fetchCelebrities = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      if (verifiedFilter !== 'all') {
        params.append('verified', verifiedFilter);
      }
      if (userId) params.append('userId', userId);
      
      const url = `${BACKEND_API_URL}/getCelebrities?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCelebrities(data.data.celebrities);
        setFilteredCelebrities(data.data.celebrities);
      } else {
        throw new Error(data.message || 'Failed to fetch celebrities');
      }
      
    } catch (err) {
      console.error('Error fetching celebrities:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch celebrities');
    } finally {
      setLoading(false);
    }
  };

  // Filter celebrities by category
  const filterByCategory = (category: string) => {
    let filtered = celebrities;
    
    if (category === 'verified') {
      filtered = celebrities.filter(celeb => celeb.isVerified);
    }
    // Add more category filtering logic based on your data structure
    // You might want to add a 'category' field to your celebrity model
    
    setFilteredCelebrities(filtered);
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
        
        setFilteredCelebrities(prev => prev.map(celeb => 
          celeb.id === celebrityId 
            ? { 
                ...celeb, 
                isFollowed: data.data.isFollowing,
                followersCount: data.data.followerCount
              }
            : celeb
        ));
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

  // Format date
  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  // Initial load
  useEffect(() => {
    fetchCelebrities();
  }, []);

  // Update when filters change
  useEffect(() => {
    fetchCelebrities();
  }, [searchTerm, sortBy, sortOrder, verifiedFilter]);

  // Filter by category when selection changes
  useEffect(() => {
    filterByCategory(selectedCategory);
  }, [selectedCategory, celebrities]);

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <Users size={64} className="mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Celebrities</h2>
          <p>{error}</p>
        </div>
        <Button color="primary" onClick={fetchCelebrities}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          Celebrity Hub
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          Discover and follow your favorite celebrities from around the world
        </p>
        
        {/* Stats */}
        <div className="flex justify-center gap-8 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{celebrities.length}</div>
            <div className="text-sm text-gray-500">Total Celebrities</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {celebrities.filter(c => c.isVerified).length}
            </div>
            <div className="text-sm text-gray-500">Verified</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {userId ? celebrities.filter(c => c.isFollowed).length : 0}
            </div>
            <div className="text-sm text-gray-500">Following</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-8 space-y-4">
        {/* Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Search celebrities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startContent={<Search size={18} />}
            className="flex-1"
            isClearable
          />
          
          <div className="flex gap-2">
            <Select
              placeholder="Sort by"
              selectedKeys={[sortBy]}
              onSelectionChange={(keys) => setSortBy(Array.from(keys)[0] as string)}
              className="w-40"
            >
              <SelectItem key="followers">Followers</SelectItem>
              <SelectItem key="posts">Posts</SelectItem>
              <SelectItem key="username">Name</SelectItem>
              <SelectItem key="createdAt">Join Date</SelectItem>
            </Select>
            
            <Select
              placeholder="Order"
              selectedKeys={[sortOrder]}
              onSelectionChange={(keys) => setSortOrder(Array.from(keys)[0] as string)}
              className="w-32"
            >
              <SelectItem key="desc">High to Low</SelectItem>
              <SelectItem key="asc">Low to High</SelectItem>
            </Select>
            
            <Select
              placeholder="Verification"
              selectedKeys={[verifiedFilter]}
              onSelectionChange={(keys) => setVerifiedFilter(Array.from(keys)[0] as string)}
              className="w-36"
            >
              <SelectItem key="all">All</SelectItem>
              <SelectItem key="true">Verified Only</SelectItem>
              <SelectItem key="false">Unverified</SelectItem>
            </Select>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs 
          selectedKey={selectedCategory}
          onSelectionChange={(key) => setSelectedCategory(key as string)}
          className="w-full"
          variant="underlined"
        >
          {Object.entries(CelebrityCategories).map(([key, category]) => {
            const IconComponent = category.icon;
            return (
              <Tab
                key={key}
                title={
                  <div className="flex items-center gap-2">
                    <IconComponent size={16} />
                    <span>{category.label}</span>
                  </div>
                }
              />
            );
          })}
        </Tabs>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <Spinner size="lg" className="mb-4" />
            <p className="text-gray-500">Loading all celebrities...</p>
          </div>
        </div>
      )}

      {/* Celebrities Grid */}
      {!loading && (
        <>
          {/* Results Count */}
          <div className="mb-6 flex items-center justify-between">
            <div className="text-gray-600 dark:text-gray-400">
              Showing {filteredCelebrities.length} celebrities
              {searchTerm && (
                <span> for "{searchTerm}"</span>
              )}
            </div>
            <Chip color="primary" variant="flat">
              No Lazy Loading - All Loaded
            </Chip>
          </div>

          {/* Grid */}
          {filteredCelebrities.length === 0 ? (
            <div className="text-center py-12">
              <Users size={64} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Celebrities Found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? `No celebrities match "${searchTerm}"`
                  : "No celebrities match your current filters"
                }
              </p>
              <Button 
                color="primary" 
                onClick={() => {
                  setSearchTerm('');
                  setVerifiedFilter('all');
                  setSelectedCategory('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCelebrities.map((celebrity) => (
                <Card key={celebrity.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col items-center text-center w-full">
                      <Avatar
                        src={celebrity.avatarUrl}
                        name={celebrity.username}
                        size="lg"
                        className="mb-3"
                      />
                      
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{celebrity.username}</h3>
                        {celebrity.isVerified && (
                          <Badge color="primary" variant="flat" size="sm">
                            <Star size={12} className="mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <Calendar size={12} className="mr-1" />
                        Joined {formatJoinDate(celebrity.createdAt)}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardBody className="pt-0 pb-2">
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                      <div>
                        <div className="font-semibold text-blue-600">
                          {formatNumber(celebrity.followersCount)}
                        </div>
                        <div className="text-gray-500">Followers</div>
                      </div>
                      <div>
                        <div className="font-semibold text-green-600">
                          {formatNumber(celebrity.followingCount)}
                        </div>
                        <div className="text-gray-500">Following</div>
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
                    <div className="flex gap-2 w-full">
                      {userId && (
                        <Button
                          color={celebrity.isFollowed ? "default" : "primary"}
                          variant={celebrity.isFollowed ? "bordered" : "solid"}
                          size="sm"
                          className="flex-1"
                          startContent={
                            followingInProgress.has(celebrity.id) ? (
                              <Spinner size="sm" />
                            ) : celebrity.isFollowed ? (
                              <UserCheck size={16} />
                            ) : (
                              <UserPlus size={16} />
                            )
                          }
                          onClick={() => handleFollowToggle(celebrity.id)}
                          disabled={followingInProgress.has(celebrity.id)}
                        >
                          {celebrity.isFollowed ? 'Following' : 'Follow'}
                        </Button>
                      )}
                      
                      <Button
                        variant="light"
                        size="sm"
                        className="flex-1"
                        startContent={<MessageSquare size={16} />}
                      >
                        View Profile
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Footer */}
      {!loading && filteredCelebrities.length > 0 && (
        <div className="text-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="text-gray-500 mb-4">
            🎉 All {filteredCelebrities.length} celebrities loaded at once - no pagination needed!
          </div>
          <div className="flex justify-center gap-4">
            <Chip color="success" variant="flat">
              ⚡ Zero Lazy Loading
            </Chip>
            <Chip color="primary" variant="flat">
              📱 Fully Responsive
            </Chip>
            <Chip color="secondary" variant="flat">
              🔍 Advanced Filtering
            </Chip>
          </div>
        </div>
      )}
    </div>
  );
}