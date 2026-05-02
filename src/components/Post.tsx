import { useState } from "react";
import { Avatar, Button } from "@mui/material";
import { DeleteForeverOutlined, Send } from "@mui/icons-material";

import "../styles/post.css";
import { IPost, ISetPosts } from "./props";
import { useAuth } from "./AuthContext";

const BASE_URL = "http://127.0.0.1:8000/";

const Post = ({ post, setPosts }: { post: IPost; setPosts: ISetPosts }) => {
  const [newComment, setNewComment] = useState<string | "">("");
  const { authToken, authFetch } = useAuth();

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
