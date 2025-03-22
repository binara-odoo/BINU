export default function Navbar() {
  return (
    <nav class="w-full px-6 py-4 fixed top-0 left-0 z-50 bg-black/80 backdrop-blur-sm">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="relative w-16 h-16">
          <video
            autoPlay
            loop
            muted
            playsInline
            class="absolute top-0 left-0 w-full h-full object-cover"
          >
            <source src="/logo-binu.mp4" type="video/mp4" />
          </video>
        </div>
        <div class="space-x-10">
          <a href="#" class="text-sm hover:opacity-75 transition-opacity">
            Sobre
          </a>
          <a href="#" class="text-sm hover:opacity-75 transition-opacity">
            Iniciar Sesión
          </a>
        </div>
      </div>
    </nav>
  );
}
