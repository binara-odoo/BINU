import { Handlers, PageProps } from "$fresh/server.ts";
import Navbar from "../../islands/navbar/Navbar.tsx";
import { Translations } from "../../types/translations.ts";
//import PagesBackground from "../../islands/background/PagesBackground.tsx";
import { LoadTranslations } from "../../utils/i18n.ts";
import { decodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import FixSystemForm from "../../islands/specs/FixSystemForm.tsx";

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
      system: system,
      userInfo: {
        name: session.name,
        email: session.email,
        picture: session.picture,
      },
    });
  },
};

export default function FixSystem({ data }: PageProps<LoginProps>) {
  const questions = [
    {
      id: "feature",
      label: data.Translations.fix_system.feature,
      type: "text",
    },
    {
      id: "expected",
      label: data.Translations.fix_system.expected,
      type: "textarea",
    },
    {
      id: "current",
      label: data.Translations.fix_system.current,
      type: "textarea",
    },
    {
      id: "steps",
      label: data.Translations.fix_system.steps,
      type: "textarea",
    },
    {
      id: "priority",
      label: data.Translations.new_system.priority,
      type: "radio",
    },
    {
      id: "context",
      label: data.Translations.fix_system.context,
      type: "file",
    },
  ];

  return (
    <div class="relative min-h-screen">
      <head>
        <title>{data.Translations.fix_system.title} {data.system}</title>
      </head>
      <div class="flex flex-col relative z-10 min-h-screen text-white">
        <Navbar
          LoggedIn={data.LoggedIn}
          Translations={data.Translations}
          lang={data.lang}
          userInfo={data.userInfo}
        />
        <main class="max-w-7xl mx-auto flex-1 pt-32">
          <h1 class="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8 text-[#8E8F1D]">
            {data.Translations.fix_system.title} {data.system}
          </h1>

          <div class="w-[95%] sm:w-[85%] md:w-[650px] lg:w-[750px] xl:w-[850px] mx-auto px-4 sm:px-6 lg:px-8 mb-24">
            <div class="form-container bg-gray-200 shadow-lg rounded-lg text-[#8E8F1D] p-4 sm:p-6 md:p-8 lg:p-10">
              <FixSystemForm
                questions={questions}
                buttonText={data.Translations.fix_system.button}
                systemName={data.system}
                translations={data.Translations}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
