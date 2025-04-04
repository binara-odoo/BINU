import Navbar from "../islands/navbar/Navbar.tsx";
import Background from "../islands/background/Background.tsx";
import VideoBlur from "../islands/main/VideoBlur.tsx";
import { Translations } from "../types/translations.ts";
import { Handlers, PageProps } from "https://deno.land/x/fresh@1.7.3/server.ts";
import { LoadTranslations } from "../utils/i18n.ts";
import ApproachCarousel from "../islands/main/ApproachCarousel.tsx";
import FeaturesCarousel from "../islands/main/FeaturesCarousel.tsx";

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
      lang: lang,
    });
  },
};

export default function Home({ data }: PageProps<HomeProps>) {
  return (
      <Background>
        <div class="min-h-screen text-white">
          <Navbar
            LoggedIn={data.LoggedIn}
            Translations={data.Translations}
            lang={data.lang}
          />
          <main>
            {/* Full height hero section to showcase background */}
            <div class="h-screen flex items-center justify-center">

            </div>

            {/* Content section */}
            <div class="container mx-auto">
              <FeaturesCarousel Translations={data.Translations} />
              <ApproachCarousel Translations={data.Translations} />
              <VideoBlur />
            </div>
          </main>
        </div>
      </Background>
  );
}
