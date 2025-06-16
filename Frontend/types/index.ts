// social-app-frontend/src/types/index.ts
import { SVGProps } from "react";

// Existing icon type
export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};


export interface SessionUser {
  user: {
    name: string;
    email: string;
    image?: null
    id: string
    role: UserRole
    isVerified: false
  }
}

// --- Enums ---
export enum UserRole {
  CELEBRITY = 'CELEBRITY',
  PUBLIC = 'PUBLIC',
}

export enum NotificationType {
  NEW_POST = 'NEW_POST',
}

// --- User Types ---
// Interface for a User as exposed by the API (e.g., in a post, or profile)
export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  avatarUrl?: string; // Optional field
  bio?: string;       // Optional field
  isVerified?: boolean; // defalut is false
  createdAt: string;  // Dates are typically ISO strings from API
  updatedAt: string;
  unreadNotificationCount: number; // Denormalized count for badge
}

// Interface for the data received when a Public user follows a Celebrity
export interface Follow {
  id: string;
  userId: string;       // The ID of the PUBLIC user who is following
  celebrityId: string;  // The ID of the CELEBRITY being followed
  createdAt: string;
}

// --- Post Types ---
// Interface for a Post
export interface Post {
  id: string;
  content: string;
  imageUrl?: string; // Optional image URL
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
    isVerified: boolean;
  };
}

// Interface for a paginated list of posts (e.g., for the infinite scroll feed)
export interface PaginatedPostsResponse {
  posts: Post[];
  totalPosts: number;
  currentPage: number;
  pageSize: number; // Number of items per page
  hasMore: boolean; // Indicates if there are more pages to load
}

// Interface for creating a new post (what the frontend sends)
export interface CreatePostPayload {
  content: string;
  imageUrl?: string;
}

// --- Notification Types ---
// Interface for a Notification
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
  userId: string;
  celebrityId: string; // The ID of the celebrity who posted
  postId: string;      // The ID of the post that triggered the notification
  // You might want to include embedded details about the celebrity and post
  // if your API provides them directly in the notification payload:
  celebrity?: {
    id: string;
    username: string;
    avatarUrl?: string;
    isVerified: boolean;
  };
  post?: {
    id: string;
    content: string;
  };
}
