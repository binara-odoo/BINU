import { Translations } from "../../types/translations.ts";
//import PagesBackground from "../../islands/background/PagesBackground.tsx";
import Navbar from "../../islands/navbar/Navbar.tsx";
import { LoadTranslations } from "../../utils/i18n.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { decodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import DashboardCard from "../../components/dashboard/DashboardCard.tsx";

interface DashboardProps {
  LoggedIn: boolean;
  Translations: Translations;
  lang: string;
  userInfo?: {
    name?: string;
    email?: string;
    picture?: string;
  };
}

export const handler: Handlers<DashboardProps> = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const lang = url.searchParams.get("lang") || "es";
    const translations = await LoadTranslations(lang);

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
      const loginUrl = new URL("/account/login", url.origin);
      loginUrl.searchParams.set("lang", lang);
      return new Response("", {
        status: 303,
        headers: { Location: loginUrl.toString() },
      });
    }

    return ctx.render({
      LoggedIn: Boolean(session?.loggedIn),
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

export default function Dashboard({ data }: PageProps<DashboardProps>) {
  const dashboardItems = [
    {
      title: data.Translations.dashboard.calendar,
      icon: "/dashboardIcons/calendar.gif",
      href: "#",
    },
    {
      title: data.Translations.dashboard.information,
      icon: "/dashboardIcons/information.gif",
      href: "#",
    },
    {
      title: data.Translations.dashboard.contacts,
      icon: "/dashboardIcons/contacts.gif",
      href: "#",
    },
    {
      title: data.Translations.dashboard.sales,
      icon: "/dashboardIcons/sales.gif",
      href: "#",
    },
    {
      title: data.Translations.dashboard.documents,
      icon: "/dashboardIcons/documents.gif",
      href: "#",
    },
    {
      title: data.Translations.dashboard.projects,
      icon: "/dashboardIcons/projects.gif",
      href: "#",
    },
    {
      title: data.Translations.dashboard.evaluations,
      icon: "/dashboardIcons/evaluations.gif",
      href: "#",
    },
    {
      title: data.Translations.dashboard.specs,
      icon: "/dashboardIcons/specs.gif",
      href: `/specs/specs?lang=${data.lang}`,
    },
  ];

  return (
    <div class="relative min-h-screen">
      <div class="flex flex-col relative z-10 min-h-screen backdrop-blur-md text-white">
        <Navbar
          LoggedIn={data.LoggedIn}
          Translations={data.Translations}
          lang={data.lang}
          userInfo={data.userInfo}
        />

        <main class="flex-1 pt-20">
          <div class="dashboard-container">
            {dashboardItems.map((item) => (
              <DashboardCard
                icon={item.icon}
                title={item.title}
                href={item.href}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
