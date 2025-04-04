interface BackgroundProps {
  children: preact.ComponentChildren;
}

export default function Background({ children }: BackgroundProps) {
  return (
    <div class="relative min-h-screen w-full">
      {/* Background Video Container */}
      <div class="fixed top-0 left-0 w-full h-full -z-10">
        {/* Video para escritorio */}
        <video
            id="video-bg"
            autoPlay
            loop
            muted
            playsInline
            class="absolute top-0 left-0 w-full h-full object-cover hidden md:block transition-[filter] duration-500 ease-out"
          >
            <source src="/background/background.mp4" type="video/mp4" />
          </video>
    
          {/* Video para móvil */}
          <video
            id="video-bg-mobile"
            autoPlay
            loop
            muted
            playsInline
            class="absolute top-0 left-0 w-full h-full object-cover block md:hidden transition-[filter] duration-500 ease-out"
          >
            <source src="/background/background-mobile.mp4" type="video/mp4" />
          </video>
      </div>

      {/* Content Container */}
      <div class="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
  }
  