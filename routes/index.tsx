import Navbar from "../components/Navbar.tsx";
import Background from "../components/Background.tsx";
import VideoBlur from "../islands/VideoBlur.tsx";
import { Translations } from "../types/translations.ts";
import { Handlers, PageProps } from "https://deno.land/x/fresh@1.7.3/server.ts";
import { LoadTranslations } from "../utils/i18n.ts";
import PagesBackground from "../components/PagesBackground.tsx";
import Carousel from "../components/Carousel.tsx";

interface HomeProps {
  LoggedIn: boolean;
  Translations: Translations;
  lang: string;
}

export const handler: Handlers<HomeProps> = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const lang = url.searchParams.get("lang") || "es"; // Idioma por defecto: es
    const translations: Translations = await LoadTranslations(lang);
    return ctx.render({
      LoggedIn: false, // Actualiza si tienes autenticación
      Translations: translations,
      lang: lang
    });
  },
};

export default function Home( { data } : PageProps<HomeProps> ) {
  return (
    <div>
    <Background>
      <div class="min-h-screen bg-black text-white">
        <Navbar LoggedIn = { data.LoggedIn } Translations = { data.Translations } lang = { data.lang }/>
        <main class="container mx-auto pt-24">
          <VideoBlur />
        </main>
    </div>
    </Background>
      <PagesBackground>
        <Carousel Translations = { data.Translations } />
      </PagesBackground>
    </div>
  );
}
