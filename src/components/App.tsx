import { useState, useEffect } from "react";

import { IPost } from "./props";
import Post from "./Post";
import Head from "./Head";
import "../styles/app.css";
import { useAuth } from "./AuthContext";

function App() {
  const [posts, setPosts] = useState<IPost[]>([]);
  const { authFetch } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    authFetch(`post/all`, {
      method: "GET",
      headers: headers,
      // Required because of Axum's allow_credentials(true)
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: IPost[]) => setPosts(data))
      .catch((err) => console.error("Fetch error:", err));
  }, [authFetch]);

  return (
    <div className="app">
      <Head setPosts={setPosts} />
      <div className="app_posts">
        {posts.map((post) => (
          <Post key={post.id} post={post} setPosts={setPosts} />
        ))}
      </div>
    </div>
  );
}

export default App;
