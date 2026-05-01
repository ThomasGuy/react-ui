import React from "react";

export type Uuid = `${string}-${string}-${string}-${string}-${string}`;

export interface IComment {
  id: Uuid;
  comment: string;
  username: string;
  timestamp: Date;
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
}

export interface IAuth {
  authToken: string | null;
  authTokenType: string | null;
  username?: string | null;
  userId?: Uuid | null;
}

export interface INewPost {
  authToken: string | null;
  authTokenType: string | null;
  setPosts: React.Dispatch<React.SetStateAction<IPost[]>>;
  onSuccess: (value: React.SetStateAction<boolean>) => void;
}

export interface INewComment {
  authToken: string | null;
  authTokenType: string | null;
  setPosts: React.Dispatch<React.SetStateAction<IPost[]>>;
}

export interface IAuthState {
  authToken: string | null;
  setAuthToken: React.Dispatch<React.SetStateAction<string | null>>;
  authTokenType: string | null;
  setAuthTokenType: React.Dispatch<React.SetStateAction<string | null>>;
  username: string | null;
  setUsername: React.Dispatch<React.SetStateAction<string | null>>;
  userId?: Uuid | null;
  setUserId: React.Dispatch<React.SetStateAction<Uuid | null>>;
  posts?: IPost[];
  setPosts: React.Dispatch<React.SetStateAction<IPost[]>>;
}
