import { useState, useEffect } from "react";

/**
 * Hook to track scroll position
 * @returns Object with scrollX, scrollY, and direction
 */
export function useScrollPosition() {
  const [scrollPosition, setScrollPosition] = useState({
    scrollX: 0,
    scrollY: 0,
  });
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");
  const [prevScrollY, setPrevScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const currentScrollX = window.scrollX;

          setScrollPosition({
            scrollX: currentScrollX,
            scrollY: currentScrollY,
          });

          setScrollDirection(currentScrollY > prevScrollY ? "down" : "up");
          setPrevScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollY]);

  return {
    ...scrollPosition,
    direction: scrollDirection,
    isAtTop: scrollPosition.scrollY < 10,
    isAtBottom:
      window.innerHeight + scrollPosition.scrollY >=
      document.documentElement.scrollHeight - 10,
  };
}