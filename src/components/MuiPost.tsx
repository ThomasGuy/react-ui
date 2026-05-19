// import React from "react";
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  Typography,
  Box,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ChatBubbleOutlined as CommentIcon,
  Delete as DeleteIcon,
  Send,
} from "@mui/icons-material";

import { PostProps } from "./types";
import { useAuth } from "./AuthContext";
import { getInstagramTallUrl } from "@/utils/sanityImage";

const Post = (props: PostProps) => {
  const { post, setView, onDeleteRequest, onLikeRequest, onCommentRequest } = props;
  const [newComment, setNewComment] = useState<string | "">("");
  const { authUsername } = useAuth();

  const absoluteImageUrl = getInstagramTallUrl(post.sanityAssetId);

  const profileHnadler = (evt: React.MouseEvent<HTMLDivElement | HTMLSpanElement, MouseEvent>) => {
    evt.preventDefault();
    setView({ type: "profile", username: post.user.username });
    window.scrollTo(0, 0);
  };

  return (
    <Card sx={{ maxWidth: 500, mb: 4, borderRadius: 3, boxShadow: 3 }}>
      {/* Header with User Info */}
      <CardHeader
        avatar={
          <Avatar
            onClick={(e) => profileHnadler(e)}
            sx={{
              bgcolor: "primary.main",
              cursor: "pointer",
              "&:hover": { color: "paleturquoise" },
            }}
          >
            {post.user.username[0].toUpperCase()}
          </Avatar>
        }
        action={
          authUsername == post.user.username && (
            <IconButton
              aria-label="delete"
              onClick={() => onDeleteRequest(post.id, post.user.username)}
              sx={{ "&:hover": { color: "error.main" } }}
            >
              <DeleteIcon />
            </IconButton>
          )
        }
        title={
          <Typography
            variant="subtitle2"
            onClick={(e) => profileHnadler(e)}
            sx={{
              fontWeight: "bold",
              cursor: "pointer",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {post.user.username}
          </Typography>
        }
        subheader={post.timestamp.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
        slotProps={{
          subheader: {
            variant: "caption",
            color: "text.secondary", // Optional: ensures it stays subtle
          },
        }}
      />

      {/* Main Image */}
      <CardMedia
        component="img"
        height="400"
        image={absoluteImageUrl}
        alt="Post content"
        sx={{ objectFit: "cover" }}
      />

      {/* Action Buttons */}
      <CardActions disableSpacing sx={{ p: 0 }}>
        {/* This pushes the comment icons to the right */}
        <Box sx={{ flexGrow: 1 }} />
        <IconButton aria-label="like" onClick={() => onLikeRequest(post.id)}>
          {post.hasLiked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
        </IconButton>
        <Typography variant="body2" sx={{ mr: 2 }}>
          {post.likesCount}
        </Typography>

        <IconButton aria-label="comment">
          <CommentIcon />
        </IconButton>
        <Typography variant="body2" sx={{ mr: 2 }}>
          {post.comments.length}
        </Typography>
      </CardActions>

      {/* Post caption */}
      {post.caption && (
        <CardContent sx={{ p: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <Box component="span" sx={{ fontWeight: "bold", color: "text.primary", mr: 1 }}>
              {post.caption}
            </Box>
          </Typography>
        </CardContent>
      )}

      {/* Comments Area */}
      <CardContent
        sx={{
          py: 0,
          maxHeight: "6rem",
          overflowY: "auto",
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-thumb": { backgroundColor: "#ccc", borderRadius: "4px" },
        }}
      >
        {post.comments.map((c) => (
          <Typography key={c.id} variant="body2" color="text.secondary">
            <Box component="span" sx={{ fontWeight: "bold", color: "text.primary", mr: 1 }}>
              {c.username}
            </Box>
            {c.comment}
          </Typography>
        ))}
      </CardContent>

      {/* {create comment} */}
      <form onSubmit={(e) => (onCommentRequest(e, post.id, newComment), setNewComment(""))}>
        <CardContent sx={{ py: 0, mt: 1 }}>
          <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              placeholder="new comment"
              value={newComment}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setNewComment(event.target.value);
              }}
              // Visual hints for mobile keyboards
              slotProps={{
                htmlInput: {
                  // Changes the mobile keyboard button text to "Send"
                  enterKeyHint: "send",
                  autoCapitalize: "sentences",
                },
              }}
            />
            <Button sx={{ whiteSpace: "nowrap" }} size="small" type="submit" disabled={!newComment}>
              <Send sx={{ color: "lightblue" }} />
            </Button>
          </Stack>
        </CardContent>
      </form>
    </Card>
  );
};

export default Post;
