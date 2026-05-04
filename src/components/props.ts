// import React from "react";
import { Dispatch, SetStateAction } from "react";

export type ISetPosts = Dispatch<SetStateAction<IPost[]>>;

export type Uuid = `${string}-${string}-${string}-${string}-${string}`;

export interface ISuccess {
  onSuccess: () => void;
}
export interface HeadProps {
  setPosts: ISetPosts;
  view: {
    type: "feed" | "profile";
    username?: string;
  };
  setView: React.Dispatch<
    React.SetStateAction<{
      type: "feed" | "profile";
      username?: string;
    }>
  >;
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
