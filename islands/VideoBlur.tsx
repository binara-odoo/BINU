// islands/VideoBlur.tsx
import { useEffect } from "preact/hooks";

export default function VideoBlur() {
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const videos = document.querySelectorAll("#video-bg, #video-bg-mobile");

      videos.forEach((video) => {
        if (scrollY > 100) {
          video.classList.add("blur-lg"); // Aplica blur
        } else {
          video.classList.remove("blur-lg"); // Elimina blur
        }
      });
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return null;
}
