/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";

import { IPost } from "./props";
import Post from "./Post";
import Head from "./Head";
import "../styles/app.css";
import { useAuth } from "./AuthContext";

function App() {
  const [posts, setPosts] = useState<IPost[]>([]);
  const { authFetch, authToken } = useAuth();
  const [view, setView] = useState<{
    type: "feed" | "profile";
    username?: string;
  }>({ type: "feed" });

  useEffect(() => {
    const endpoint =
      view.type === "profile" ? `post/user/${view.username}` : "post"; // your all_posts route

    authFetch(endpoint)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => setPosts(data))
      .catch((err) => console.error("Fetch error view:", err));
  }, [view, authFetch]); // Re-fetch whenever the view changes

  useEffect(() => {
    const fetch_all = async () => {
      try {
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };

        if (authToken) {
          headers["Authorization"] = `Bearer ${authToken}`;
        }

        const res = await authFetch(`post/all`, {
          method: "GET",
          headers: headers,
        });

        if (res.ok) {
          const allPosts = await res.json();
          const formatted: IPost[] = allPosts.map((post: any) => ({
            ...post,
            timestamp: new Date(post.created_at),
            user: { username: post.user.username },
          }));
          setPosts(formatted);
        }
      } catch (err) {
        console.error("post_all failed", err);
      }
    };
    fetch_all();
  }, [authFetch, authToken]);

  return (
    <div className="app">
      <Head setPosts={setPosts} />
      <div className="app_posts">
        {posts.map((post) => (
          <Post
            key={post.id}
            post={post}
            setPosts={setPosts}
            setView={setView}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
