// import React from "react";
import { Box, Typography } from "@mui/material";
import { IPost } from "./types";
import { getInstagramTallUrl } from "../utils/sanityImage";

interface ProfileGridProps {
  profilePosts: IPost[];
  onPostClick: (post: IPost) => void;
}

export const ProfileGrid = ({ profilePosts, onPostClick }: ProfileGridProps) => {
  if (profilePosts.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", mt: 8 }}>
        No posts yet
      </Typography>
    );
  }

  return (
    // Explicit modern CSS Grid container mapping standard 3/4-column rows
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "repeat(3, 1fr)", md: "repeat(4, 1fr)" },
        gap: { xs: "3px", sm: "12px" }, // Ultra-thin gaps on mobile, spacious on desktop
        width: "100%",
        height: "100%",
        maxWidth: 935, // Matches real Instagram web max-width grid boundary
        margin: "0 auto",
        px: { xs: 0, sm: 2 },
      }}
    >
      {profilePosts.map((post) => {
        // Compute the absolute 3:4 optimization CDN url locally for each grid box item
        const gridImageUrl = getInstagramTallUrl(post.sanityAssetId);

        return (
          <Box
            key={post.id}
            onClick={() => onPostClick(post)}
            sx={{
              position: "relative",
              width: "100%",
              aspectRatio: "3 / 4", // Enforces your chosen 3:4 portrait layout boundaries
              overflow: "hidden",
              bgcolor: "grey.200", // Serves as an instant native fallback backdrop placeholder
              cursor: "pointer",
              borderRadius: { xs: 0, sm: 1 }, // Seamless flush design on mobile screen blocks
              "&:hover .grid-overlay": {
                opacity: 1, // Triggers interaction overlay on desktop hover actions
              },
            }}
          >
            {/* The Optimized Sanity Image Asset */}
            <Box
              component="img"
              src={gridImageUrl}
              alt={post.caption || "Grid item"}
              loading="lazy" // Native browser lazy-loading optimization for long profile scrolling
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover", // Guarantees no warping across varying image dimensions
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  transform: "scale(1.02)", // Subtle interactive zoom feedback anchor
                },
              }}
            />

            {/* Hover Engagement Overlay (Desktop/Tablet interactive view) */}
            <Box
              className="grid-overlay"
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                bgcolor: "rgba(0, 0, 0, 0.3)", // Dim background tint filter layout
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                opacity: 0, // Hidden by default, activated during focus rules
                transition: "opacity 0.2s ease",
                pointerEvents: "none", // Prevents the overlay framework layer from highjacking clicks
                display: { xs: "none", md: "flex" }, // Complete suppression on handheld touchscreens
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                View Post
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};
