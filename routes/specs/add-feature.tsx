import { Handlers, PageProps } from "$fresh/server.ts";
import Navbar from "../../islands/navbar/Navbar.tsx";
import { Translations } from "../../types/translations.ts";
//import PagesBackground from "../../islands/background/PagesBackground.tsx";
import { LoadTranslations } from "../../utils/i18n.ts";
import { decodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import AddFeatureForm from "../../islands/specs/AddFeatureForm.tsx";

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

export default function AddFeature({ data }: PageProps<LoginProps>) {
  const questions = [
    {
      id: "feature",
      label: data.Translations.add_feature.feature,
      type: "text",
    },
    {
      id: "why",
      label: data.Translations.add_feature.why,
      type: "textarea",
    },
    {
      id: "users",
      label: data.Translations.add_feature.users,
      type: "textarea",
    },
    {
      id: "requirements",
      label: data.Translations.add_feature.requirements,
      type: "textarea",
    },
    {
      id: "priority",
      label: data.Translations.new_system.priority,
      type: "radio",
    },
    {
      id: "integration",
      label: data.Translations.add_feature.integration,
      type: "textarea",
    },
    {
      id: "images",
      label: data.Translations.add_feature.images,
      type: "file",
    },
  ];

  return (
    <div class="relative min-h-screen">
      <head>
        <title>{data.Translations.add_feature.title} {data.system}</title>
      </head>
      <div class="flex flex-col relative z-10 min-h-screen  text-white">
        <Navbar
          LoggedIn={data.LoggedIn}
          Translations={data.Translations}
          lang={data.lang}
          userInfo={data.userInfo}
        />
        <main class="max-w-7xl mx-auto flex-1 pt-32">
          <h1 class="text-2xl font-bold text-center mb-8 text-[#8E8F1D]">
            {data.Translations.add_feature.title} {data.system}
          </h1>

          <div class="w-[95%] sm:w-[85%] md:w-[650px] lg:w-[750px] xl:w-[850px] mx-auto px-4 sm:px-6 lg:px-8 mb-24">
            <div class="form-container bg-gray-200 shadow-lg rounded-lg text-[#8E8F1D] p-6">
              <AddFeatureForm 
                questions={questions}
                buttonText={data.Translations.add_feature.button}
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
