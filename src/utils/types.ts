import React from 'react';
import { AppBarProps } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';

// 🚀 Extract the union object shape
type ViewState = {
  type: 'feed' | 'profile' | 'admin_users';
  username?: string;
};

// 🚀 Create the exact callable signature for the state setter function
export type ISetViewFn = Dispatch<SetStateAction<ViewState>>;

export type Uuid = `${string}-${string}-${string}-${string}-${string}`;

export type ISetPosts = React.Dispatch<React.SetStateAction<IPost[]>>;

export interface ISuccess {
  onSuccess: () => void;
}

export interface HeadProps extends AppBarProps {
  setFeedPosts: ISetPosts;
  view: {
    type: 'feed' | 'profile' | 'admin_users';
    username?: string;
  };
  setView: ISetViewFn;
}

export interface PostProps {
  post: IPost;
  setView: ISetViewFn;
  onDeleteRequest: (id: Uuid, username: string) => void;
  onLikeRequest: (id: Uuid) => void;
  onCommentRequest: (e: React.SubmitEvent<HTMLFormElement>, id: Uuid, comment: string) => void;
}

export interface IComment {
  id: Uuid;
  comment: string;
  username: string;
  timestamp: string;
}

export interface IPost {
  id: Uuid;
  userId: Uuid;
  caption: string | null;
  sanityImage: ISanityImage;
  timestamp: Date;
  user: { username: string };
  comments: IComment[];
  likesCount: number;
  hasLiked: boolean;
  viewCount?: number;
}

export interface IPostResponse {
  id: Uuid;
  userId: Uuid;
  caption: string | null;
  username: string;
  sanityImage: ISanityImage;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  comments: IComment[];
}

export interface INewPost {
  setPosts: React.Dispatch<React.SetStateAction<IPost[]>>;
  onSuccess: () => void;
}

export interface IAuthUser {
  id: string; // maps to 'sub'
  isAdmin: boolean;
  type: 'Access' | 'Refresh';
}

export interface IUserResponse {
  id: Uuid;
  email: string;
  username: string;
  isAdmin: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}

// ------------------- Login --------------------

export interface ILoginUser {
  id: Uuid;
  email: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  isAdmin: boolean;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IUser {
  id: Uuid;
  email: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  isAdmin: boolean;
  emailVerifiedAt: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILoginResponse {
  authToken: string;
  authTokenType: string;
  user: ILoginUser;
}

export interface ILogin {
  authToken: string;
  authTokenType: string;
  user: IUser;
}

//----------------------- Sanity -------------------------

export interface ISanityImage {
  asset: {
    _ref: string;
    _type: 'reference';
  };
  hotspot?: {
    x: number; // Centers of attention (0 to 1)
    y: number;
    height: number;
    width: number;
  };
  crop?: {
    top: number; // Crop offsets (0 to 1)
    bottom: number;
    left: number;
    right: number;
  };
}

// ---------------- User Update Profile -----------
export interface IUpdateProfilePayload {
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
}
