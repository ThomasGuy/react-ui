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

export type ISetPosts = Dispatch<SetStateAction<IPost[]>>;

export interface ISuccess {
  onSuccess: () => void;
}

export interface HeadProps extends AppBarProps {
  setFeedPosts: ISetPosts;
  view: ViewState;
  setView: ISetViewFn;
}

export interface PostProps {
  post: IPost;
  setView: ISetViewFn;
  onDeleteRequest: (id: Uuid, username: string) => void;
  onLikeRequest: (id: Uuid) => void;
  onCommentRequest: (e: React.SubmitEvent<HTMLFormElement>, id: Uuid, comment: string) => void;
}

//  -----------------   Posts  --------------------------------
export interface IComment {
  id: Uuid;
  comment: string;
  username: string;
  timestamp: string;
}

export interface UserSummary {
  username: string;
  avatarUrl?: string | null; // 🚀 ADDED: Matches your backend JSON key exactly
}

export interface IPost {
  id: Uuid;
  userId: Uuid;
  caption: string | null;
  sanityImage: ISanityImage;
  timestamp: Date;
  user: UserSummary;
  comments: IComment[];
  likesCount: number;
  hasLiked: boolean;
  viewCount?: number;
}

export interface IPostResponse {
  id: Uuid;
  userId: Uuid;
  caption: string | null;
  user: UserSummary;
  sanityImage: ISanityImage;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  comments?: IComment[];
  likesCount?: number;
  hasLiked?: boolean;
}

//  -----------------------------------------------//

export interface INewPost {
  setPosts: React.Dispatch<React.SetStateAction<IPost[]>>;
  onSuccess: () => void;
}

export interface IAuthUser {
  id: string; // maps to 'sub'
  isAdmin: boolean;
  type: 'Access' | 'Refresh';
}

// ------------------- Login --------------------

export interface IUserResponse {
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
  user: IUserResponse;
}

export interface ILogin {
  authToken: string;
  authTokenType: string;
  user: IUser;
}

//----------------------- Sanity -------------------------

export type Hotspot = {
  _type: 'sanity.imageHotspot'; // 🚀 Locks into the required Sanity namespace
  x: number; // Centers of attention (0 to 1)
  y: number;
  height: number;
  width: number;
};

export type ISetHotspotFn = Dispatch<SetStateAction<Hotspot>>;

export type Crop = {
  _type: 'sanity.imageCrop'; // 🚀 Locks into the required Sanity namespace
  top: number; // Crop offsets (0 to 1)
  bottom: number;
  left: number;
  right: number;
};

export type ISetCropFn = Dispatch<SetStateAction<Crop>>;

export interface ISanityImage {
  _type: 'image'; // 🚀 Required structural identifier on the parent container
  asset: {
    _ref: string;
    _type: 'reference';
  };
  hotspot?: Hotspot;
  crop?: Crop;
}

// ---------------- User Update Profile -----------
export interface IUpdateProfilePayload {
  displayName?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
}

// ---------------- IModalProps ---------------
export interface IModalProps {
  open: boolean;
  onClose: () => void;
}

export interface IModalPostProps extends IModalProps {
  setPosts: ISetPosts;
}

export interface IModalLoginProps extends IModalProps {
  signUp: Dispatch<SetStateAction<boolean>>;
}
