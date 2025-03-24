import { Translations } from "../types/translations.ts";
import LanguageDropdown from "../islands/LanguageDropdown.tsx";

interface NavProps {
  LoggedIn: boolean;
  Translations: Translations;
  lang: string;
}

export default function Navbar({ LoggedIn, Translations, lang }: NavProps) {

  const menu = [
    { name: Translations.menu.home, href: `/?lang=${lang}` },
    { name: Translations.menu.about, href: "#" },
  ];

  const loggedInMenu = [
    { name: Translations.menu.systems, href: "#" },
    { name: Translations.menu.account, href: "#" },
    { name: Translations.menu.logout, href: "#" },
  ];

  const nonLoggedInMenu = [
    { name: Translations.menu.login, href: `/login?lang=${lang}` },
  ];

  return (
    <nav class="w-full px-6 py-4 fixed top-0 left-0 z-50 bg-black/80 backdrop-blur-sm">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="relative w-16 h-16">
          <video
            autoPlay
            loop
            muted
            playsInline
            class="absolute top-0 left-0 w-full h-full object-cover"
          >
            <source src="/logo-binu.mp4" type="video/mp4" />
          </video>
        </div>
        <div class="space-x-8">
          {/* Regular menu itmes */}
          {menu.map((item) => (
            <a
              href={item.href}
              class="text-sm hover:opacity-75 transition-opacity"
            >
              {item.name}
            </a>
          ))}
          {/* Conditional menu items base on login status */}
          {LoggedIn
            ? (
              loggedInMenu.map((item) => (
                <a
                  href={item.href}
                  class="text-sm hover:opacity-75 transition-opacity"
                >
                  {item.name}
                </a>
              ))
            )
            : (
              nonLoggedInMenu.map((item) => (
                <a
                  href={item.href}
                  class="text-sm hover:opacity-75 transition-opacity"
                >
                  {item.name}
                </a>
              ))
            )}
          {/* Language dropdown using Translations */}
          <LanguageDropdown 
            languages={[
              { code: "es", name: Translations.languages.es },
              { code: "en", name: Translations.languages.en },
            ]}
            currentLang={lang}
            menuText={Translations.menu.lang}
          />
        </div>
      </div>
    </nav>
  );
}
