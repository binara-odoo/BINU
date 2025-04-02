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

export default function FixSystem({ data }: PageProps<LoginProps>) {
    const fields = [
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
          id: "context",
          label: data.Translations.fix_system.context,
          type: "textarea",
        },
      ];

  return (
    <div class="relative min-h-screen">
      <head>
        <title>{data.Translations.fix_system.title} {data.system}</title>
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
              {data.Translations.fix_system.title} {data.system}
            </h1>

            <div class="max-w-3xl mx-auto mb-20">
              <div class="w-full bg-gray-800/80 backdrop-blur-sm rounded-lg shadow p-6">
                <form class="space-y-6">
                  {fields.map((field) => (
                    <div key={field.id} class="space-y-2">
                      <label class="block text-sm font-medium text-white">
                        {field.label}
                      </label>
                      {field.type === "textarea" ? (
                        <textarea
                          name={field.id}
                          class="w-full p-2 border rounded-md min-h-[100px] text-white bg-[rgba(16,13,20,0.741)] border-gray-700 focus:border-[#B4E3FF] focus:outline-none focus:ring-1 focus:ring-[#B4E3FF] transition-all duration-300"
                        />
                      ) : (
                        <input
                          type={field.type}
                          name={field.id}
                          class="w-full p-2 border rounded-md text-white bg-[rgba(16,13,20,0.741)] border-gray-700 focus:border-[#B4E3FF] focus:outline-none focus:ring-1 focus:ring-[#B4E3FF] transition-all duration-300"
                        />
                      )}
                    </div>
                  ))}
                  <div class="flex justify-end">
                    <button
                      type="submit"
                      class="px-4 py-2 text-white rounded-md bg-blue-300"
                    >
                      {data.Translations.fix_system.button}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </main>
        </div>
      </PagesBackground>
    </div>
  );
}
