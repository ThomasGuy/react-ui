import { useRef, useCallback } from "react";

interface UseInfiniteScrollProps {
  loading: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
}

export const useInfiniteScroll = ({ loading, onLoadMore, hasMore }: UseInfiniteScrollProps) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Callback ref targets the absolute bottom tracking node element in the DOM tree
  const bottomBoundaryRef = useCallback(
    (node: HTMLElement | null) => {
      if (loading) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          // If the bottom boundary enters the screen view port, trigger fetch execution
          if (entries[0].isIntersecting && hasMore) {
            onLoadMore();
          }
        },
        {
          // "200px" tells the browser to trigger onLoadMore when the sentinel
          // element is still 200px below the bottom of the viewport!
          rootMargin: "200px",
        }
      );

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [loading, hasMore, onLoadMore]
  );

  return bottomBoundaryRef;
};
