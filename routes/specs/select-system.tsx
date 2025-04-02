import { Handlers, PageProps } from "$fresh/server.ts";
import Navbar from "../../islands/navbar/Navbar.tsx";
import { Translations } from "../../types/translations.ts";
import PagesBackground from "../../components/background/PagesBackground.tsx";
import { LoadTranslations } from "../../utils/i18n.ts";
import { decodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

interface LoginProps {
  LoggedIn: boolean;
  Translations: Translations;
  lang: string;
  userInfo?: {
    name?: string;
    email?: string;
    picture?: string;
  };
}

export const handler: Handlers<LoginProps> = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const lang = url.searchParams.get("lang") || "es";
    const translations = await LoadTranslations(lang);

    // Check authentication
    const cookies = req.headers.get("cookie") || "";
    const sessionCookie = cookies.split("; ").find(c => c.startsWith("session="));
    let session = null;
    
    if (sessionCookie) {
      try {
        const encodedSession = sessionCookie.split("=")[1];
        const decodedSession = new TextDecoder().decode(decodeBase64(encodedSession));
        session = JSON.parse(decodedSession);
      } catch (error) {
        console.error("Error decoding session:", error);
      }
    }

    // Redirect to login if not authenticated
    if (!session?.loggedIn) {
      const loginUrl = new URL("/auth", url.origin);
      loginUrl.searchParams.set("lang", lang);
      return new Response("", {
        status: 303,
        headers: { Location: loginUrl.toString() },
      });
    }

    return ctx.render({
      LoggedIn: true,
      Translations: translations,
      lang: lang,
      userInfo: {
        name: session.name,
        email: session.email,
        picture: session.picture,
      },
    });
  },
};

export default function SelectSystem({ data }: PageProps<LoginProps>) {
  const systems = ["Odoo", "Magnu", "Binu"];

  return (
    <div class="relative min-h-screen">
      <head>
        <title>{data.Translations.existing_system.title}</title>
      </head>
      <PagesBackground>
        <div class="flex flex-col relative z-10 min-h-screen bg-black/15 backdrop-blur-md text-white">
          <Navbar
            LoggedIn={data.LoggedIn}
            Translations={data.Translations}
            lang={data.lang}
            userInfo={data.userInfo}
          />
          <main class="max-w-7xl mx-auto flex-1 pt-32">
            <h1 class="text-2xl font-bold text-center mb-8 neon-text">
              {data.Translations.existing_system.title}
            </h1>

            <div class="max-w-3xl mx-auto mb-20">
              <div class="bg-gray-800/80 backdrop-blur-sm rounded-lg shadow p-6">
                {systems.map((system, index) => (
                  <div
                    key={system}
                    class={`p-4 hover:bg-gray-900 cursor-pointer ${
                      index !== systems.length - 1 ? "border-b" : ""
                    }`}
                  >
                    <a href={`/specs/system-options?system=${system}&lang=${data.lang}`} class="block">
                      {system}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </PagesBackground>
    </div>
  );
}
