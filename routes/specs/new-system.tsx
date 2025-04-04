import { Handlers, PageProps } from "$fresh/server.ts";
import Navbar from "../../islands/navbar/Navbar.tsx";
import { Translations } from "../../types/translations.ts";
import PagesBackground from "../../islands/background/PagesBackground.tsx";
import { LoadTranslations } from "../../utils/i18n.ts";
import NewSystemForm from "../../islands/NewSystemForm.tsx";
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

export default function NewSystem({ data }: PageProps<LoginProps>) {
  const questions = [
    {
      id: "new_system_name",
      label: data.Translations.new_system.new_system_name,
      type: "text",
    },
    {
      id: "purpose",
      label: data.Translations.new_system.purpose,
      type: "textarea",
    },
    {
      id: "users",
      label: data.Translations.new_system.users,
      type: "textarea",
    },
    {
      id: "timeline",
      label: data.Translations.new_system.timeline,
      type: "text",
    },
    {
      id: "budget",
      label: data.Translations.new_system.budget,
      type: "text",
    },
    {
      id: "features",
      label: data.Translations.new_system.features,
      type: "textarea",
    },
    {
      id: "date",
      label: data.Translations.new_system.date,
      type: "date",
    },
    {
      id: "responsible",
      label: data.Translations.new_system.responsible,
      type: "selector"
    }
  ];

  return (
    <div class="relative min-h-screen">
      <head>
        <title>{data.Translations.new_system.title}</title>
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
              {data.Translations.new_system.title}
            </h1>
            <div class="max-w-3xl mx-auto mb-20">
              <div class="bg-gray-800/80 backdrop-blur-sm rounded-lg shadow p-6">
                <NewSystemForm 
                  questions={questions}
                  buttonText={data.Translations.new_system.button}
                />
              </div>
            </div>
          </main>
        </div>
      </PagesBackground>
    </div>
  );
}