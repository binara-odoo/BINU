import { Handlers, PageProps } from "$fresh/server.ts";
import Navbar from "../../islands/navbar/Navbar.tsx";
import { Translations } from "../../types/translations.ts";
import PagesBackground from "../../components/background/PagesBackground.tsx";
import { LoadTranslations } from "../../utils/i18n.ts";
import DashboardCard from "../../components/dashboard/DashboardCard.tsx";

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
        }
    ]

  return (
    <div class="relative min-h-screen">
      <PagesBackground>
        <div class="flex flex-col relative z-10 min-h-screen bg-black/15 backdrop-blur-md text-white">
            <Navbar
                LoggedIn={data.LoggedIn}
                Translations={data.Translations}
                lang={data.lang}
            />
            <main class="flex-1 pt-20">
                <div class="dashboard-container">
                    { dashboardItems.map( (item) => (
                        <DashboardCard
                            icon={item.icon}
                            title={item.title}
                            href={item.href}
                        />
                    ))}
                </div>
            </main>
        </div>
      </PagesBackground>
    </div>
  );
}