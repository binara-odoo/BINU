import { Handlers, PageProps } from "$fresh/server.ts";
import { Translations } from "../types/translations.ts";
import { LoadTranslations } from "../utils/i18n.ts";
import PagesBackground from "../islands/background/PagesBackground.tsx";
import Navbar from "../islands/navbar/Navbar.tsx";

interface DashboardProps {
  LoggedIn: boolean;
  Translations: Translations;
  lang: string;
}

export const handler: Handlers<DashboardProps> = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const lang = url.searchParams.get("lang") || "es";
    const translations = await LoadTranslations(lang);

    const cookies = req.headers.get("cookie") || "";
    const sessionCookie = cookies.split("; ").find(c => c.startsWith("session="));
    const session = sessionCookie ? JSON.parse(decodeURIComponent(sessionCookie.split("=")[1])) : null;

    // Redirect to login if not authenticated
    if (!session?.loggedIn) {
      return new Response("", {
        status: 303,
        headers: { Location: "/account/login" },
      });
    }

    return ctx.render({
      LoggedIn: true,
      Translations: translations,
      lang: lang,
    });
  },
};

export default function Dashboard({ data }: PageProps<DashboardProps>) {
  return (
    <div class="relative min-h-screen">
      <PagesBackground>
        <div class="relative z-10 min-h-screen bg-black/50 text-white">
          <Navbar
            LoggedIn={data.LoggedIn}
            Translations={data.Translations}
            lang={data.lang}
          />
          <main class="container mx-auto px-4 py-8">
            <h1 class="text-3xl font-bold mb-6">Dashboard</h1>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Add your dashboard content here */}
            </div>
          </main>
        </div>
      </PagesBackground>
    </div>
  );
} 