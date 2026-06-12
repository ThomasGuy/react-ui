import React from 'react';
import { AppBarProps } from '@mui/material';

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
  setView: React.Dispatch<
    React.SetStateAction<{
      type: 'feed' | 'profile' | 'admin_users';
      username?: string;
    }>
  >;
}

export interface PostProps {
  post: IPost;
  setView: React.Dispatch<
    React.SetStateAction<{
      type: 'feed' | 'profile' | 'admin_users';
      username?: string;
    }>
  >;
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
  sanityAssetId: string;
  timestamp: Date;
  user: { username: string };
  comments: IComment[];
  likesCount: number;
  hasLiked: boolean;
  viewCount?: number;
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

export interface IPostResponse {
  id: Uuid;
  userId: Uuid;
  caption: string | null;
  username: string;
  sanityAssetId: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  comments: IComment[];
}
