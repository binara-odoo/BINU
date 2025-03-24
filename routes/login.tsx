import { Handlers, PageProps } from "$fresh/server.ts";
import { Translations } from "../types/translations.ts";
import { LoadTranslations } from "../utils/i18n.ts";
import PagesBackground from "../components/PagesBackground.tsx";
import Navbar from "../components/Navbar.tsx";

interface LoginProps {
  LoggedIn: boolean;
  Translations: Translations;
  lang: string;
}

export const handler: Handlers<LoginProps> = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const lang = url.searchParams.get("lang") || "es";
    const translations = await LoadTranslations(lang);

    return ctx.render({
      LoggedIn: false,
      Translations: translations,
      lang: lang,
    });
  },
};

export default function Login({ data }: PageProps<LoginProps>) {
  return (
    <div class="relative min-h-screen">
      <PagesBackground>
        <div class="relative z-10 min-h-screen bg-black/50 text-white">
          <Navbar
            LoggedIn={data.LoggedIn}
            Translations={data.Translations}
            lang={data.lang}
          />
          <section class="flex flex-col items-center justify-center min-h-screen px-6">
            <div class="mx-auto mb-10">
              <h2 class="text-white text-4xl font-bold text-center">
                {data.Translations.login.title}
              </h2>
            </div>

            <div class="w-full bg-gray-800/80 backdrop-blur-sm rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
              <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                <form class="space-y-4 md:space-y-6">
                  <div>
                    <label
                      htmlFor="email"
                      class="block mb-2 text-sm font-medium text-white dark:text-white"
                    >
                      {data.Translations.login.email}
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder={data.Translations.login.email_placeholder}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="password"
                      class="block mb-2 text-sm font-medium text-white dark:text-white"
                    >
                      {data.Translations.login.password}
                    </label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <button
                      type="submit"
                      class="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                      {data.Translations.login.login}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        </div>
      </PagesBackground>
    </div>
  );
}
