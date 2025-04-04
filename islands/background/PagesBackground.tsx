import { useEffect, useState } from "preact/hooks";

interface PagesBackgroundProps {
  children: preact.ComponentChildren;
}

export default function PagesBackground({ children }: PagesBackgroundProps) {
  const [desktopVideoLoaded, setDesktopVideoLoaded] = useState(false);
  const [mobileVideoLoaded, setMobileVideoLoaded] = useState(false);

  useEffect(() => {
    // Preload videos
    const preloadVideo = (src: string): Promise<boolean> => {
      return new Promise((resolve) => {
        const video = document.createElement('video');
        video.src = src;
        video.onloadeddata = () => resolve(true);
        video.onerror = () => resolve(false);
      });
    };

    Promise.all([
      preloadVideo('/background/PageBackground.mp4'),
      preloadVideo('/background/MobilePageBackground.mp4')
    ]).then(([desktop, mobile]) => {
      if (typeof desktop === 'boolean') setDesktopVideoLoaded(desktop);
      if (typeof mobile === 'boolean') setMobileVideoLoaded(mobile);
    });
  }, []);

  const handleDesktopVideoLoad = () => {
    setDesktopVideoLoaded(true);
  };

  const handleMobileVideoLoad = () => {
    setMobileVideoLoaded(true);
  };

  return (
    <div class="relative min-h-screen w-full">
      {/* Background Video Container */}
      <div class="fixed top-0 left-0 w-full h-full -z-10">
        {/* Loading placeholder */}
        <div 
          class={`absolute inset-0 bg-gradient-to-b from-gray-900 to-black transition-opacity duration-1000 ${
            (desktopVideoLoaded || mobileVideoLoaded) ? 'opacity-0' : 'opacity-100'
          }`} 
        />

        {/* Desktop video */}
        <video
          id="video-bg"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onLoadedData={handleDesktopVideoLoad}
          class={`absolute top-0 left-0 w-full h-full object-cover hidden md:block transition-opacity duration-1000 ${
            desktopVideoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <source src="/background/PageBackground.mp4" type="video/mp4" />
        </video>
  
        {/* Mobile video */}
        <video
          id="video-bg-mobile"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onLoadedData={handleMobileVideoLoad}
          class={`absolute top-0 left-0 w-full h-full object-cover block md:hidden transition-opacity duration-1000 ${
            mobileVideoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <source src="/background/MobilePageBackground.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Content Container */}
      <div class="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
}
    