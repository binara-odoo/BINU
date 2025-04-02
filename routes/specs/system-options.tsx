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
  system: string;
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
    const system = url.searchParams.get("system") || "";
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
      system: system,
      userInfo: {
        name: session.name,
        email: session.email,
        picture: session.picture,
      },
    });
  },
};

export default function SystemOptions({ data }: PageProps<LoginProps>) {
  const options = [
    {
      id: "fix",
      label: data.Translations.existing_system.fix,
      href: `/specs/fix?system=${data.system}&lang=${data.lang}`,
    },
    {
      id: "add",
      label: data.Translations.existing_system.add,
      href: `/specs/add-feature?system=${data.system}&lang=${data.lang}`,
    },
  ];

  return (
    <div class="relative min-h-screen">
      <head>
        <title>{data.Translations.existing_system.options} - {data.system}</title>
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
              {data.Translations.existing_system.options} {data.system}
            </h1>

            <div class="max-w-3xl mx-auto mb-20">
              <div class="w-full bg-gray-800/80 backdrop-blur-sm rounded-lg shadow p-6">
                {options.map((option, index) => (
                  <div
                    key={option.id}
                    class={`p-4 hover:bg-gray-900 cursor-pointer ${
                      index !== options.length - 1 ? "border-b border-gray-700" : ""
                    }`}
                  >
                    <a href={option.href} class="block">
                      {option.label}
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
