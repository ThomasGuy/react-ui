import React, { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";

import "../../styles/newPost.css";
import { INewPost, IPost } from "../types";
import { style } from "./modal_style";
import { useAuth } from "../AuthContext";

const NewPost = ({ setPosts, onSuccess }: INewPost) => {
  const [image, setImage] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const { authFetch } = useAuth();

  const handleFileData = (evt: React.ChangeEvent<HTMLInputElement>): void => {
    const imgData = evt.target.files ? evt.target.files[0] : null;
    if (imgData) {
      setImage(imgData);
    }
  };

  const handleCreatePost = async (
    evt: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    evt?.preventDefault();
    try {
      // 1. First async step: Upload the image file
      const formData = new FormData();
      if (image) formData.append("file", image);
      const imgResponse = await authFetch("post/image", {
        method: "POST",
        body: formData, // your Multipart data
      });

      if (!imgResponse.ok) throw new Error("Image upload failed");
      const { filename } = await imgResponse.json();

      // STEP 2: Send the JSON to save the post in Postgres
      const postResponse = await authFetch(`post/create`, {
        method: "POST",
        body: JSON.stringify({
          image_url: filename,
          image_url_type: "relative",
          caption: caption,
        }),
      });

      if (postResponse.ok) {
        const newPostData = await postResponse.json();
        const formattedPost: IPost = {
          ...newPostData,
          timestamp: new Date(newPostData.created_at),
          user: { username: newPostData.username },
          comments: [],
        };
        setPosts((prev) => [formattedPost, ...prev]);
        window.scrollTo(0, 0);
        setImage(null);
        setCaption("");
        onSuccess();
      }
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  return (
    <Box sx={style}>
      <div className="post_title">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/250px-Instagram_logo_2022.svg.png"
          alt="instagram"
        />
        <Typography id="modal-modal-title" variant="h6" component="h2">
          <center>New Post</center>
        </Typography>
      </div>
      <div className="post_body">
        <TextField
          type="text"
          placeholder="Enter a caption"
          onChange={(evt) => setCaption(evt.target.value)}
          value={caption}
        />
        <br />
        <TextField type="file" id="fileInput" onChange={handleFileData} />
        <br />
        <Button
          variant="contained"
          color="primary"
          type="submit"
          onClick={handleCreatePost}
        >
          UPLOAD
        </Button>
      </div>
    </Box>
  );
};

export default NewPost;
