import { useState } from "react";
import { Avatar, Button } from "@mui/material";
import { DeleteForeverOutlined, Send } from "@mui/icons-material";

import "../styles/post.css";
import { IPost, INewComment } from "./props";

const BASE_URL = "http://127.0.0.1:8000/";

const Post = ({ post, auth }: { post: IPost; auth: INewComment }) => {
  const { authToken, authTokenType, setPosts } = auth;
  const [newComment, setNewComment] = useState<string | "">("");

  const handleDelete = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault();

    try {
      const response = await fetch(`${BASE_URL}post/delete/${post.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${authTokenType} ${authToken}`,
        },
      });

      if (response.ok) {
        // 1. Instantly remove the post from the UI
        setPosts((prevPosts) => prevPosts.filter((p) => p.id !== post.id));

        // 2. Optional: Scroll to top or show a small notification
        console.log("Post deleted successfully");
      } else {
        console.error("Failed to delete post on server");
      }
    } catch (err) {
      console.error("Network error during delete:", err);
    }
  };

  const handlePostComment = async (
    evt: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    evt.preventDefault();

    try {
      const response = await fetch(`${BASE_URL}comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${authTokenType} ${authToken}`,
        },
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
    } catch (error) {
      console.error("Fetch error: ", error);
    }
  };

  return (
    <div className="post">
      <div className="post_header">
        <Avatar alt="Sport" src="" />
        <h3 className="post_headerInfo">{post.user.username}</h3>
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
