import { Handlers, PageProps } from "$fresh/server.ts";
import Navbar from "../islands/navbar/Navbar.tsx";
import { Translations } from "../types/translations.ts";
import { LoadTranslations } from "../utils/i18n.ts";
import { decodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

interface ErrorProps {
  message: string;
  Translations: Translations;
  lang: string;
  LoggedIn: boolean;
  userInfo?: {
    name?: string;
    email?: string;
    picture?: string;
  };
}

export const handler: Handlers<ErrorProps> = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const message = url.searchParams.get("message") || "An error occurred";
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

    return ctx.render({
      message,
      Translations: translations,
      lang,
      LoggedIn: !!session?.loggedIn,
      userInfo: session?.loggedIn ? {
        name: session.name,
        email: session.email,
        picture: session.picture,
      } : undefined,
    });
  },
};

export default function Error({ data }: PageProps<ErrorProps>) {
  return (
    <div class="relative min-h-screen">
      <head>
        <title>Error</title>
      </head>
      <div class="flex flex-col relative z-10 min-h-screen text-white">
        <Navbar
          LoggedIn={data.LoggedIn}
          Translations={data.Translations}
          lang={data.lang}
          userInfo={data.userInfo}
        />
        <main class="max-w-7xl mx-auto flex-1 pt-32">
          <div class="w-[95%] sm:w-[85%] md:w-[650px] lg:w-[750px] xl:w-[850px] mx-auto px-4 sm:px-6 lg:px-8 mb-20">
            <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg">
              <div class="flex">
                <div class="py-1">
                  <svg class="h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="font-bold text-lg">Error</p>
                  <p class="text-base">{data.message}</p>
                </div>
              </div>
            </div>
            <div class="mt-8 text-center">
              <a 
                href="/specs/new-system" 
                class="px-4 py-2 bg-[#8E8F1D] text-white rounded-md hover:bg-[#6b6d16] transition-colors duration-300"
              >
                Go Back
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 