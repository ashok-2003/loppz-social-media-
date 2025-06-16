import { AuthOptions} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

// --- Define types directly in this file ---
export enum UserRole {
  CELEBRITY = 'CELEBRITY',
  PUBLIC = 'PUBLIC',
}

// Extend NextAuth types to include custom user/session properties
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id?: string;
      role?: UserRole;
      isVerified?: boolean;
      username?: string;
      backendAccessToken?: string; // Add if you want to pass backend's JWT
    };
  }
  interface User extends DefaultUser {
    id?: string;
    role?: UserRole;
    isVerified?: boolean;
    username?: string;
    backendAccessToken?: string; // Add if you want to pass backend's JWT
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    isVerified?: boolean;
    fusername?: string; // Renamed from 'username' to 'fusername' to avoid conflict if 'name' is used
    avatarUrl?: string | null;
    backendAccessToken?: string; // Add if you want to pass backend's JWT
  }
}

// Interface for the user data expected from your backend API
interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  isVerified: boolean;
  unreadNotificationCount: number;
  avatarUrl: string | null;
  token?: string; // Backend's JWT is now returned as 'token'
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        username: { label: "Username (optional for login, required for signup)", type: "text", placeholder: "Your name" },
        email: { label: "Email", type: "email", placeholder: "your email" },
        password: { label: "Password", type: "password" },
        role: { label: "Celebrity Role", type: "text" }, // Changed from checkbox to text to handle string values
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.password) {
          throw new Error('Email and password are required.');
        }

        const BACKEND_API_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL;

        try {
          const response = await axios.post(`${BACKEND_API_URL}/auth`, {
            email: credentials.email,
            password: credentials.password,
            username: credentials.username,
            // Convert string 'true'/'false' to boolean
            ...(credentials.role !== undefined && { role: credentials.role === 'true' }),
          });

          const data: { user: AuthUser; token?: string } = response.data; // Expect both user and token

          const backendUser: AuthUser = data.user;
          const backendJWT: string | undefined = data.token; // Capture the backend's JWT

          if (!backendUser || !backendUser.id || !backendUser.email || !backendUser.username || !backendUser.role) {
            throw new Error('Backend response missing required user data (id, email, username, role).');
          }

          // Return object that NextAuth.js expects from 'authorize'.
          // We map our custom 'username' to 'name', and explicitly set 'image' based on backend's avatarUrl.
          // Also, pass the backend's JWT if it exists.
          return {
            id: backendUser.id,
            email: backendUser.email,
            name: backendUser.username, // Map backend's username to NextAuth's 'name'
            role: backendUser.role, // Custom property
            isVerified: backendUser.isVerified ?? false, // Custom property, ensure it's boolean
            image: backendUser.avatarUrl, // Use avatarUrl from backend for NextAuth's 'image' property
            backendAccessToken: backendJWT, // Pass the backend's JWT if available
          } as DefaultUser & {
            role: UserRole;
            isVerified: boolean;
            username: string;
            backendAccessToken?: string; // Add this type to the returned object
          };

        } catch (axiosError: any) {
          const errorMessage = axiosError.response?.data?.message || axiosError.message || 'An unexpected error occurred during authentication.';
          console.error('Error calling backend authentication API:', errorMessage);
          throw new Error(errorMessage);
        }
      }
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: { 
    signIn: '/login' // Custom login page
  },
  callbacks: {
    async jwt({ token, user }) {
      // 'user' parameter here is of type `DefaultUser | AdapterUser | undefined`.
      // We explicitly check if 'user' is present and then cast it to our extended DefaultUser type.
      if (user) {
        const authenticatedUser = user as DefaultUser & {
            role: UserRole;
            isVerified: boolean;
            username: string;
            backendAccessToken?: string; // Assert this property exists on the user object
        };
        // Populate the token with desired custom properties from `authenticatedUser`
        token.id = authenticatedUser.id;
        token.role = authenticatedUser.role;
        token.isVerified = authenticatedUser.isVerified;
        token.fusername = authenticatedUser.username; // Use 'fusername' for custom username in JWT
        token.avatarUrl = authenticatedUser.image; // Map NextAuth's 'image' to our custom 'avatarUrl' in JWT
        token.backendAccessToken = authenticatedUser.backendAccessToken; // Pass the backend's JWT to NextAuth's internal token
      }
      return token;
    },
    async session({ session, token }) {
      // Ensure properties from JWT are passed to the client session
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.isVerified = token.isVerified;
        session.user.username = token.fusername; // Get username from 'fusername' in JWT
        // Transfer default NextAuth properties from token to session.user
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.image = token.avatarUrl ?? null;
        session.user.backendAccessToken = token.backendAccessToken; // Make backend's JWT available in session
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};