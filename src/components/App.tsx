/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";

import { IPost } from "./props";
import Post from "./Post";
import Head from "./Head";
import "../styles/app.css";
import { useAuth } from "./AuthContext";

function App() {
  const [posts, setPosts] = useState<IPost[]>([]);
  const { authFetch } = useAuth();
  const [view, setView] = useState<{
    type: "feed" | "profile";
    username?: string;
  }>({ type: "feed" });

  useEffect(() => {
    if (view.type === "profile" && !view.username) return;

    const endpoint =
      view.type === "profile" ? `post/user/${view.username}` : "post/all"; // all_posts route

    authFetch(endpoint)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        const formatted: IPost[] = data.map((post: any) => ({
          ...post,
          timestamp: new Date(post.created_at),
          user: { username: post.user.username },
        }));
        setPosts(formatted);
      })
      .catch((err) => console.error("Fetch error view:", err));
  }, [view, authFetch]); // Re-fetch whenever the view changes

  return (
    <div className="app">
      <Head setPosts={setPosts} view={view} setView={setView} />
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
