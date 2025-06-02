import React from "react";

export interface IComment {
  id: number;
  text: string;
  username: string;
  timestamp: Date;
}

export interface IPost {
  id: number;
  image_url: string;
  image_url_type: string;
  caption: string;
  user_id: string;
  timestamp: Date;
  user: { username: string };
  comments: IComment[];
}

export interface IAuth {
  authToken: string | null;
  authTokenType: string | null;
  username?: string | null;
  userId?: string | null;
}

export interface IAuthState {
  authToken: string | null;
  setAuthToken: React.Dispatch<React.SetStateAction<string | null>>;
  authTokenType: string | null;
  setAuthTokenType: React.Dispatch<React.SetStateAction<string | null>>;
  username: string | null;
  setUsername: React.Dispatch<React.SetStateAction<string | null>>;
  userId: string | null;
  setUserId: React.Dispatch<React.SetStateAction<string | null>>;
}
