/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Box, Button, Input, Stack, TextField, Typography } from "@mui/material";

import { INewPost, IPost, IPostResponse } from "../types";
import { style } from "./modal_style";
import { useAuth } from "../AuthContext";

export const NewPost = ({ setPosts, onSuccess }: INewPost) => {
  const [image, setImage] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { authFetch } = useAuth();

  const handleFileData = (evt: React.ChangeEvent<HTMLInputElement>): void => {
    const imgData = evt.target.files ? evt.target.files[0] : null;
    if (imgData) {
      setImage(imgData);
    }
  };

  const handleCreatePost = async (evt?: React.SyntheticEvent) => {
    evt?.preventDefault();
    setLoading(true);
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
        const newPostData = (await postResponse.json()) as IPostResponse;
        const formattedPost: IPost = {
          ...newPostData,
          caption: newPostData.caption ?? "",
          timestamp: new Date(newPostData.created_at),
          user: { username: newPostData.username },
          comments: [],
          likes_count: 0,
          has_liked: false,
          view_count: newPostData.view_count || 0,
        };

        setPosts((prev) => [formattedPost, ...prev]);
        window.scrollTo(0, 0);
        onSuccess();
      }
    } catch (err) {
      console.error("Upload failed", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onKeyDownListener = (evt: any) => {
    if (evt.key === "Enter") {
      evt.preventDefault(); // Just in case, stops any bubbling
      console.log("Key pressed!");
      if (image && !loading) {
        console.log("Key pressed! 2");
        handleCreatePost(evt as any);
      }
    }
  };

  return (
    <Box sx={style}>
      <Stack direction="row" sx={{ mb: 3, alignItems: "center" }} spacing={2}>
        <Box
          component="img"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/250px-Instagram_logo_2022.svg.png"
          alt="instagram"
          sx={{ height: 30, width: "auto", display: { xs: "none", sm: "block" } }}
        />
        <Typography id="modal-mewPost-title" variant="h5" sx={{ flexGrow: 1, textAlign: "center" }}>
          New post
        </Typography>
        <Box sx={{ width: { xs: 0, sm: "30px" } }} />
      </Stack>

      <Stack spacing={2} sx={{ mt: 2 }}>
        <TextField
          name="caption"
          placeholder="Enter a caption"
          onChange={(evt) => setCaption(evt.target.value)}
          value={caption}
        />

        <Box>
          <Typography variant="caption" sx={{ display: "block" }} gutterBottom>
            Select Image:
          </Typography>
          <Input
            type="file"
            id="fileInput"
            onChange={handleFileData}
            onKeyDown={onKeyDownListener}
          />
        </Box>

        <Button
          variant="text"
          color="primary"
          type="submit"
          disabled={!image || loading}
          onClick={handleCreatePost}
        >
          {loading ? "Uploading..." : "Upload"}
        </Button>

        {error && <Typography color="error">{error}</Typography>}
      </Stack>
    </Box>
  );
};
