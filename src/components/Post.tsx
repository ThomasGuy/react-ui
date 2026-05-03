import { useState } from "react";
import { Avatar, Button } from "@mui/material";
import { DeleteForeverOutlined, Send } from "@mui/icons-material";

import "../styles/post.css";
import { PostProps } from "./props";
import { useAuth } from "./AuthContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Post = ({ post, setPosts, setView }: PostProps) => {
  const [newComment, setNewComment] = useState<string | "">("");
  const { authToken, authFetch } = useAuth();
  const [isLiking, setIsLiking] = useState(false);

  const handleDelete = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault();

    const response = await authFetch(`post/delete/${post.id}`, {
      method: "DELETE",
    });

    if (response.status == 403) {
      alert("Unauthorized -- not your post --");
    } else if (response.ok) {
      // 1. Instantly remove the post from the UI
      setPosts((prevPosts) => prevPosts.filter((p) => p.id !== post.id));
    }
  };

  const handlePostComment = async (
    evt: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    evt.preventDefault();

    const response = await authFetch("comment", {
      method: "POST",
      body: JSON.stringify({
        post_id: post.id,
        comment: newComment,
      }),
    });

    if (response.ok) {
      const createdComment = await response.json();

      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === post.id
            ? { ...p, comments: [...p.comments, createdComment] }
            : p,
        ),
      );
    }
    setNewComment("");
  };

  const handleLike = async () => {
    if (!authToken) {
      alert("Login to like posts!");
      return;
    }
    if (isLiking) return;
    setIsLiking(true);

    try {
      const res = await authFetch(`post/like/${post.id}`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json(); // Returns { status: "liked" } or "unliked"

        // Update the local state so the 0 flips to 1 immediately
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id === post.id) {
              return {
                ...p,
                has_liked: data.status === "liked",
                likes_count:
                  data.status === "liked"
                    ? p.likes_count + 1
                    : p.likes_count - 1,
              };
            }
            return p;
          }),
        );
      }
    } catch (err) {
      console.error("Like failed", err);
    } finally {
      // 3. Unlock the door (this runs even if the fetch fails)
      setIsLiking(false);
    }
  };

  return (
    <div className="post">
      <div className="post_header">
        <Avatar alt="Sport" src="" />
        <h3
          className="post_headerInfo"
          onClick={() =>
            setView({ type: "profile", username: post.user.username })
          }
        >
          {post.user.username}
        </h3>
        <div className="post_delete">
          <Button onClick={handleDelete}>
            <DeleteForeverOutlined htmlColor="lightblue" />
          </Button>
        </div>
      </div>

      <img
        className="post_image"
        src={`${BASE_URL}images/${post.image_url}`}
        alt={post.caption ? post.caption : "nothing"}
      />

      <div className="post_footer">
        <div className="post_like_section">
          {/* The Clickable Heart */}
          <button onClick={handleLike}>
            {post.has_liked ? (
              <span style={{ color: "red" }}>❤️</span>
            ) : (
              <span>🤍</span>
            )}
          </button>

          {/* The Count */}
          <h4 className="post_like_count">
            {post.likes_count} {post.likes_count === 1 ? "like" : "likes"}
          </h4>
        </div>
      </div>

      <h4 className="post_caption">{post.caption}</h4>

      <div className="post_comments">
        {post.comments.map((c) => (
          <p key={c.id}>
            <strong>{c.username}: </strong>
            {c.comment}
          </p>
        ))}
      </div>

      {authToken && (
        <form className="post_commentbox">
          <input
            className="post_input"
            id="newCom"
            type="text"
            placeholder="Add a comment"
            value={newComment}
            onChange={(evt) => setNewComment(evt.target.value)}
          />
          <button
            className="post_button"
            type="submit"
            disabled={!newComment}
            onClick={handlePostComment}
          >
            <Send />
          </button>
        </form>
      )}
    </div>
  );
};

export default Post;
