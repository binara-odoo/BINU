interface BackgroundProps {
  children: preact.ComponentChildren;
}

export default function Background({ children }: BackgroundProps) {
    return (
      <div
        id="video-container"
        class="relative w-full h-screen overflow-hidden"
      >
        {/* Video para escritorio */}
        <video
          id="video-bg"
          autoPlay
          loop
          muted
          playsInline
          class="absolute top-0 left-0 w-full h-full object-cover hidden md:block transition-[filter] duration-500 ease-out"
        >
          <source src="/background.mp4" type="video/mp4" />
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
          <source src="/background-mobile.mp4" type="video/mp4" />
        </video>
        { /* Render children on top of the background */}
        { children }
      </div>
    );
  }
  