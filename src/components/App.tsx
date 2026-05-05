/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";

import { IPost } from "./types";
import Post from "./Post";
import Head from "./Head";
import "../styles/app.css";
import { useAuth } from "./AuthContext";
import { AdminUserList } from "./Admin";

function App() {
  const [posts, setPosts] = useState<IPost[]>([]);
  const { authFetch, user } = useAuth();
  const [view, setView] = useState<{
    type: "feed" | "profile" | "admin_users";
    username?: string;
  }>({ type: "feed" });

  useEffect(() => {
    if (
      view.type === "admin_users" ||
      (view.type === "profile" && !view.username)
    )
      return;

    const endpoint =
      view.type === "profile" ? `post/user/${view.username}` : "post/all"; // all_posts route

    authFetch(endpoint)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        // console.log("Raw Post date: ", data);
        const formatted: IPost[] = data.map((post: any) => ({
          ...post,
          timestamp: new Date(post.created_at),
          user: { username: post.user.username },
        }));
        setPosts(formatted);
      })
      .catch((err) => console.error("Fetch error view:", err));
  }, [view, authFetch]); // Re-fetch whenever the view changes

  // Helper function to render the "Center Piece" of your app
  const renderContent = () => {
    switch (view.type) {
      case "admin_users":
        return user?.isAdmin ? <AdminUserList /> : <div>Access Denied</div>;

      case "profile":
      case "feed":
      default:
        return posts.map((post) => (
          <Post
            key={post.id}
            post={post}
            setPosts={setPosts}
            setView={setView}
          />
        ));
    }
  };

  return (
    <div className="app">
      <Head setPosts={setPosts} view={view} setView={setView} />
      <div className="app_posts">{renderContent()}</div>
    </div>
  );
}

export default App;
