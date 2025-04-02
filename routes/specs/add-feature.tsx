import { Handlers, PageProps } from "$fresh/server.ts";
import Navbar from "../../islands/navbar/Navbar.tsx";
import { Translations } from "../../types/translations.ts";
import PagesBackground from "../../components/background/PagesBackground.tsx";
import { LoadTranslations } from "../../utils/i18n.ts";

interface LoginProps {
  LoggedIn: boolean;
  Translations: Translations;
  lang: string;
  system: string;
}

interface PageData {
  // menuItems: MenuItem[];
  user?: {
    name: string;
    email: string;
    picture?: string;
  };
}

export const handler: Handlers<LoginProps> = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const lang = url.searchParams.get("lang") || "es";
    const system = url.searchParams.get("system") || "";
    const translations = await LoadTranslations(lang);

    return ctx.render({
      LoggedIn: false,
      Translations: translations,
      lang: lang,
      system: system,
    });
  },
};

export default function AddFeature({ data }: PageProps<LoginProps>) {
    const fields = [
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
          id: "integration",
          label: data.Translations.add_feature.integration,
          type: "textarea",
        },
      ];

  return (
    <div class="relative min-h-screen">
      <head>
        <title>{data.Translations.add_feature.title} {data.system}</title>
      </head>
      <PagesBackground>
        <div class="flex flex-col relative z-10 min-h-screen bg-black/15 backdrop-blur-md text-white">
          <Navbar
            LoggedIn={data.LoggedIn}
            Translations={data.Translations}
            lang={data.lang}
          />
          <main class="max-w-7xl mx-auto flex-1 pt-32">
            <h1 class="text-2xl font-bold text-center mb-8 neon-text">
              {data.Translations.add_feature.title} {data.system}
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
                      {data.Translations.add_feature.button}
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
