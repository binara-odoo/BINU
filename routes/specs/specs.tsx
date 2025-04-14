import { Handlers, PageProps } from "$fresh/server.ts";
import { Translations } from "../../types/translations.ts";
// import PagesBackground from "../../islands/background/PagesBackground.tsx";
import { LoadTranslations } from "../../utils/i18n.ts";
import Navbar from "../../islands/navbar/Navbar.tsx";
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
    const sessionCookie = cookies.split("; ").find((c) =>
      c.startsWith("session=")
    );
    let session = null;

    if (sessionCookie) {
      try {
        const encodedSession = sessionCookie.split("=")[1];
        const decodedSession = new TextDecoder().decode(
          decodeBase64(encodedSession),
        );
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

export default function Specs({ data }: PageProps<LoginProps>) {
  return (
    <div class="relative min-h-screen">
      <head>
        <title>{data.Translations.specs_menu.title}</title>
      </head>

      <div class="flex flex-col relative z-10 min-h-screen text-white">
        <Navbar
          LoggedIn={data.LoggedIn}
          Translations={data.Translations}
          lang={data.lang}
          userInfo={data.userInfo}
        />
        <main class="max-w-7xl mx-auto flex-1 pt-32">
          <h1 class="text-2xl font-bold text-center mb-8 text-[#8E8F1D]">
            {data.Translations.specs_menu.title}
          </h1>
          <div class="max-w-2xl mx-auto">
            <div class="form-container shadow-lg rounded-lg text-[#8E8F1D] p-4 sm:p-6 md:p-8">
              <div class="p-4 hover:bg-[#121212] cursor-pointer rounded-lg">
                <a href={`/specs/new-system?lang=${data.lang}`} class="block">
                  {data.Translations.specs_menu.new_system}
                </a>
              </div>
              <div class="p-4 hover:bg-[#121212] cursor-pointer rounded-lg">
                <a
                  href={`/specs/select-system?lang=${data.lang}`}
                  class="block"
                >
                  {data.Translations.specs_menu.existing_system}
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
