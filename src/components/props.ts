// import React from "react";
import { Dispatch, SetStateAction } from "react";

export type ISetPosts = Dispatch<SetStateAction<IPost[]>>;

export type Uuid = `${string}-${string}-${string}-${string}-${string}`;

export interface ISuccess {
  onSuccess: () => void;
}
export interface HeadProps {
  setPosts: ISetPosts;
}

export interface PostProps {
  post: IPost;
  setPosts: ISetPosts;
  setView: React.Dispatch<
    React.SetStateAction<{
      type: "feed" | "profile";
      username?: string;
    }>
  >;
}

export interface IComment {
  id: Uuid;
  comment: string;
  username: string;
  timestamp: string;
}

export interface IPost {
  id: Uuid;
  user_id: Uuid;
  caption: string | null;
  image_url: string;
  image_url_type: string;
  timestamp: Date;
  user: { username: string };
  comments: IComment[];
  likes_count: number;
  has_liked: boolean;
}

export interface INewPost {
  setPosts: ISetPosts;
  onSuccess: () => void;
}

export interface ILogin {
  access_token: string | null;
  authTokenType: string | null;
  refresh_token: string | null;
  username: string | null;
  userId: Uuid | null;
  // setAuthToken: React.Dispatch<React.SetStateAction<string | null>>;
  // setAuthTokenType: React.Dispatch<React.SetStateAction<string | null>>;
  // setRefreshToken: React.Dispatch<React.SetStateAction<string | null>>;
  // setUsername: React.Dispatch<React.SetStateAction<string | null>>;
  // setUserId: React.Dispatch<React.SetStateAction<Uuid | null>>;
}

export interface IUser {
  id: Uuid;
  email: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_active: boolean | null;
  is_admin: boolean | null;
  email_verified_at: string | null;
  last_login_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// This matches the Json<AuthResponse> from your Rust code
export interface IAuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string; // Matches your Rust 'token_type: "Bearer".to_string()'
  user: IUser; // The nested user object
}
