import { Handlers, PageProps } from "$fresh/server.ts";
import Navbar from "../../islands/navbar/Navbar.tsx";
import { Translations } from "../../types/translations.ts";
import PagesBackground from "../../islands/background/PagesBackground.tsx";
import { LoadTranslations } from "../../utils/i18n.ts";

interface LoginProps {
  LoggedIn: boolean;
  Translations: Translations;
  lang: string;
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
    const translations = await LoadTranslations(lang);

    return ctx.render({
      LoggedIn: false,
      Translations: translations,
      lang: lang,
    });
  },
};

export default function Dashboard2({ data }: PageProps<LoginProps>) {
  const dashboardItems = [
    {
      title: data.Translations.dashboard.calendar,
      icon: "/dashboardIcons/calendar.gif",
      href: "/#",
    },
    {
      title: data.Translations.dashboard.information,
      icon: "/dashboardIcons/information.gif",
      href: "/#",
    },
    {
      title: data.Translations.dashboard.contacts,
      icon: "/dashboardIcons/contacts.gif",
      href: "/#",
    },
    {
      title: data.Translations.dashboard.sales,
      icon: "/dashboardIcons/sales.gif",
      href: "/#",
    },
    {
      title: data.Translations.dashboard.documents,
      icon: "/dashboardIcons/documents.gif",
      href: "/#",
    },
    {
      title: data.Translations.dashboard.projects,
      icon: "/dashboardIcons/projects.gif",
      href: "/#",
    },
    {
      title: data.Translations.dashboard.evaluations,
      icon: "/dashboardIcons/evaluations.gif",
      href: "/#",
    },
    {
      title: data.Translations.dashboard.specs,
      icon: "/dashboardIcons/specs.gif",
      href: `/specs?lang=${data.lang}`,
    },
  ];

  return (
    <div class="relative min-h-screen">
      <PagesBackground>
        <div class="flex flex-col relative z-10 min-h-screen bg-black/15 backdrop-blur-md text-white">
          <Navbar
            LoggedIn={data.LoggedIn}
            Translations={data.Translations}
            lang={data.lang}
          />
          <main class="flex-1 pt-20 mt-10">
            <div class="p-4 ">
              <div class="p-4 border-2 border-gray-700 border-dashed rounded-lg">
                <div class="grid grid-cols-3 gap-4 mb-4">
                  {dashboardItems.slice(0, 3).map((item) => (
                    <a
                      href={item.href}
                      key={item.title}
                      class="flex flex-col items-center justify-center h-24 rounded-sm bg-[rgba(16,13,20,0.741)] backdrop-blur-sm transition-all duration-300 hover:transform hover:-translate-y-1 relative group cursor-pointer"
                    >
                      <div class="absolute top-0 left-1/2 w-0.5 h-0.5 bg-[#8E8F1D] rounded-sm transition-all duration-400 group-hover:w-[calc(100%+4px)] group-hover:h-[calc(100%+4px)] group-hover:top-[-2px] group-hover:left-[-2px] group-hover:bg-transparent group-hover:border-2 group-hover:border-[#8E8F1D] group-hover:shadow-[0_0_10px_#8E8F1D,0_0_20px_#8E8F1D]">
                      </div>
                      <img
                        src={item.icon}
                        alt={item.title}
                        class="w-12 h-12 mb-2"
                      />
                      <span class="text-sm text-[#8E8F1D] font-medium">
                        {item.title}
                      </span>
                    </a>
                  ))}
                </div>
                <div class="flex flex-col items-center justify-center h-48 mb-4">
                  <a
                    href={dashboardItems[3].href}
                    class="flex flex-col items-center justify-center h-48 w-full rounded-sm bg-[rgba(16,13,20,0.741)] backdrop-blur-sm transition-all duration-300 hover:transform hover:-translate-y-1 relative group cursor-pointer"
                  >
                    <div class="absolute top-0 left-1/2 w-0.5 h-0.5 bg-[#8E8F1D] rounded-sm transition-all duration-400 group-hover:w-[calc(100%+4px)] group-hover:h-[calc(100%+4px)] group-hover:top-[-2px] group-hover:left-[-2px] group-hover:bg-transparent group-hover:border-2 group-hover:border-[#8E8F1D] group-hover:shadow-[0_0_10px_#8E8F1D,0_0_20px_#8E8F1D]">
                    </div>
                    <img
                      src={dashboardItems[3].icon}
                      alt={dashboardItems[3].title}
                      class="w-16 h-16 mb-2"
                    />
                    <span class="text-sm text-[#8E8F1D] font-medium">
                      {dashboardItems[3].title}
                    </span>
                  </a>
                </div>
                <div class="grid grid-cols-2 gap-4 mb-4">
                  {dashboardItems.slice(4, 8).map((item) => (
                    <a
                      href={item.href}
                      key={item.title}
                      class="flex flex-col items-center justify-center rounded-sm bg-[rgba(16,13,20,0.741)] backdrop-blur-sm h-28 transition-all duration-300 hover:transform hover:-translate-y-1 relative group cursor-pointer"
                    >
                      <div class="absolute top-0 left-1/2 w-0.5 h-0.5 bg-[#8E8F1D] rounded-sm transition-all duration-400 group-hover:w-[calc(100%+4px)] group-hover:h-[calc(100%+4px)] group-hover:top-[-2px] group-hover:left-[-2px] group-hover:bg-transparent group-hover:border-2 group-hover:border-[#8E8F1D] group-hover:shadow-[0_0_10px_#8E8F1D,0_0_20px_#8E8F1D]">
                      </div>
                      <img
                        src={item.icon}
                        alt={item.title}
                        class="w-12 h-12 mb-2"
                      />
                      <span class="text-sm text-[#8E8F1D] font-medium">
                        {item.title}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </PagesBackground>
    </div>
  );
}
