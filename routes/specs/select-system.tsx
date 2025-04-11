import { Handlers, PageProps } from "$fresh/server.ts";
import Navbar from "../../islands/navbar/Navbar.tsx";
import { Translations } from "../../types/translations.ts";
// import PagesBackground from "../../islands/background/PagesBackground.tsx";
import { LoadTranslations } from "../../utils/i18n.ts";
import { decodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import SelectSystemIsland from "../../islands/specs/SelectSystem.tsx";

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

interface OdooProjects {
  id: number;
  name: string;
  partner_id: [number, string];
  date_start: string;
  date: string;
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

export default function SelectSystem({ data }: PageProps<LoginProps>) {
  return (
    <div class="relative min-h-screen">
      <head>
        <title>{data.Translations.existing_system.title}</title>
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
            {data.Translations.existing_system.title}
          </h1>

          <div class="w-[95%] sm:w-[85%] md:w-[500px] lg:w-[600px] xl:w-[700px] mx-auto px-4 sm:px-6 lg:px-8 mb-20">
            <SelectSystemIsland lang={data.lang} />
          </div>
        </main>
      </div>
    </div>
  );
}