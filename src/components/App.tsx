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
      .then((res) => res.json())
      .then((data) => setPosts(data));
  }, [view, authFetch]); // Re-fetch whenever the view changes

  useEffect(() => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    authFetch(`post/all`, {
      method: "GET",
      headers: headers,
      // Required because of Axum's allow_credentials(true)
      // credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: IPost[]) => setPosts(data))
      .catch((err) => console.error("Fetch error:", err));
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
