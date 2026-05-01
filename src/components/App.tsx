/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useState, useEffect } from "react";

import { IAuthState, INewComment, IPost, Uuid } from "./props";
import Post from "./Post";
import Head from "./Head";
import "../styles/app.css";

const BASE_URL = "http://127.0.0.1:8000/";

function App() {
  const [posts, setPosts] = useState<IPost[]>([]);
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<Uuid | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authTokenType, setAuthTokenType] = useState<string | null>(null);

  useEffect(() => {
    setAuthToken(window.localStorage.getItem("authToken"));
    setAuthTokenType(window.localStorage.getItem("authTokenType"));
    setUsername(window.localStorage.getItem("username"));

    const storedUserId = window.localStorage.getItem("userId");
    setUserId(storedUserId as Uuid | null);
  }, []);

  useEffect(() => {
    authToken
      ? window.localStorage.setItem("authToken", authToken)
      : window.localStorage.removeItem("authToken");
    authTokenType
      ? window.localStorage.setItem("authTokenType", authTokenType)
      : window.localStorage.removeItem("authTokenType");
    username
      ? window.localStorage.setItem("username", username)
      : window.localStorage.removeItem("username");
    userId
      ? window.localStorage.setItem("userId", userId)
      : window.localStorage.removeItem("userId");
  }, [authToken, authTokenType, userId, username]);

  useEffect(() => {
    const requestOptions = {
      method: "Get",
      headers: {
        "Content-Type": "application/json", // MUST be present
      },
    };
    fetch(BASE_URL + "post/all", requestOptions)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then((data) => {
        setPosts(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const props: IAuthState = {
    authToken,
    setAuthToken,
    authTokenType,
    setAuthTokenType,
    username,
    setUsername,
    userId,
    setUserId,
    posts,
    setPosts,
  };

  const auth: INewComment = {
    authToken,
    authTokenType,
    setPosts,
  };

  return (
    <div className="app">
      <Head {...props} />
      <div className="app_posts">
        {posts.map((post) => (
          <Post key={post.id} post={post} auth={auth} />
        ))}
      </div>
    </div>
  );
}

export default App;
