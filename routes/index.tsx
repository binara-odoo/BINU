import { useSignal } from "@preact/signals";
import Counter from "../islands/Counter.tsx";
import Navbar from "../components/Navbar.tsx";
import Background from "../components/Background.tsx";
import VideoBlur from "../islands/VideoBlur.tsx";

export default function Home() {
  return (
    <div class="min-h-screen bg-black text-white">
      <Navbar />
      <main class="container mx-auto pt-24">
        <Background />
        <VideoBlur />
      </main>
    </div>
  );
}
