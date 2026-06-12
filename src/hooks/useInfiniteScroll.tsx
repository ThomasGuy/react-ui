import { useRef, useCallback } from 'react';

interface UseInfiniteScrollProps {
  loading: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
  postsLength: number;
}

export const useInfiniteScroll = ({
  loading,
  onLoadMore,
  hasMore,
  postsLength,
}: UseInfiniteScrollProps) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Callback ref targets the absolute bottom tracking node element in the DOM tree
  const bottomBoundaryRef = useCallback(
    (node: HTMLElement | null) => {
      // 2. SAFETY GAP: Exit immediately if the app is currently fetching
      // OR if we haven't loaded any initial posts yet.
      if (loading || postsLength === 0) return;

      if (loading) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          // If the bottom boundary enters the screen view port, trigger fetch execution
          if (entries[0].isIntersecting && hasMore && !loading) {
            onLoadMore();
          }
        },
        {
          // "200px" tells the browser to trigger onLoadMore when the sentinel
          // element is still 200px below the bottom of the viewport!
          rootMargin: '200px',
        },
      );

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [loading, hasMore, onLoadMore, postsLength],
  );

  return bottomBoundaryRef;
};
