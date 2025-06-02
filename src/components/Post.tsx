import { useState, useEffect } from "react";
import { Avatar, Button } from "@mui/material";
import { DeleteForeverOutlined, Send } from "@mui/icons-material";

import "../styles/post.css";
import { IPost, IComment, IAuth } from "./props";

const BASE_URL = "http://127.0.0.1:8000/";

const Post = ({ post, auth }: { post: IPost; auth: IAuth }) => {
  const { authToken, authTokenType, username } = auth;
  const [comments, setComments] = useState<IComment[]>([]);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [newComment, setNewComment] = useState<string | "">("");

  useEffect(() => {
    setComments(post.comments);
    if (post.image_url_type == "absolute") {
      setImageUrl(post.image_url);
    } else {
      setImageUrl(BASE_URL + post.image_url);
    }
  }, [post]);

  const handleDelete = (
    evt: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void => {
    evt?.preventDefault();

    const requestOptions = {
      method: "DELETE",
      headers: new Headers({
        Authorization: authTokenType + " " + authToken,
      }),
    };
    fetch(BASE_URL + "post/delete/" + post.id, requestOptions)
      .then((response) => {
        if (response.ok) {
          window.location.reload();
        }
        throw response;
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const postComment = (
    evt: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void => {
    evt?.preventDefault();
    const json_string = JSON.stringify({
      username: username,
      text: newComment,
      post_id: post.id,
    });

    const requestOptions = {
      method: "POST",
      headers: new Headers({
        Authorization: authTokenType + " " + authToken,
        "Content-Type": "application/json",
      }),
      body: json_string,
    };

    fetch(BASE_URL + "comment", requestOptions)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then(() => {
        fetchComments();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setNewComment("");
      });
  };

  const fetchComments = () => {
    fetch(BASE_URL + "comment/all/" + post.id)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw response;
      })
      .then((data) => {
        setComments(data);
      })
      .catch((err) => {
        console.log(err);
      });
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
      <img className="post_image" src={imageUrl} alt={post.caption} />
      <h4 className="post_caption">{post.caption}</h4>
      <div className="post_comments">
        {comments.map((comment, idx) => (
          <p key={idx}>
            <strong>{comment.username}: </strong>
            {comment.text}
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
            onClick={postComment}
          >
            <Send />
          </button>
        </form>
      )}
    </div>
  );
};

export default Post;
