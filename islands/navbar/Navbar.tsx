import { Translations } from "../../types/translations.ts";
import LanguageDropdown from "./LanguageDropdown.tsx";
import { useState } from "preact/hooks";
import Sidebar from "./Sidebar.tsx";
import ProfileDropdown from "./ProfileDropdown.tsx";

interface NavProps {
  LoggedIn: boolean;
  Translations: Translations;
  lang: string;
  userInfo?: {
    name?: string;
    email?: string;
    picture?: string;
  };
}

export default function Navbar({ LoggedIn, Translations, lang, userInfo }: NavProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  const loggedInMenu = [
    { name: Translations.menu.home, href: `/dashboard/dashboard?lang=${lang}` },
  ];

  const nonLoggedInMenu = [
    { name: Translations.menu.home, href: `/?lang=${lang}` },
  ];

  const menu = LoggedIn ? loggedInMenu : nonLoggedInMenu;

  return (
    <>
      <nav class="w-full px-6 py-4 fixed top-0 left-0 z-50 bg-black/80 backdrop-blur-sm">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
          <button
            type="button"
            id="logo-button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            class="relative w-16 h-16 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              class="absolute top-0 left-0 w-full h-full object-cover"
            >
              <source src="/logo-binu.mp4" type="video/mp4" />
            </video>
          </button>
          <div class="flex items-center space-x-8">
            {/* Menu items based on login state */}
            {menu.map((item) => (
              <a
                href={item.href}
                class="text-sm hover:opacity-75 transition-opacity"
              >
                {item.name}
              </a>
            ))}
            
            {/* Language dropdown */}
            <LanguageDropdown 
              languages={[
                { code: "es", name: Translations.languages.es },
                { code: "en", name: Translations.languages.en },
              ]}
              currentLang={lang}
              menuText={Translations.menu.lang}
            />

            {/* Profile or Login button */}
            {LoggedIn ? (
              <ProfileDropdown
                userInfo={userInfo || { name: "User", email: "", picture: "" }}
                Translations={Translations}
                lang={lang}
              />
            ) : (
              <div class="flex items-center space-x-4">
                <a
                  href={`/auth?lang=${lang}`}
                  class="text-sm hover:opacity-75 transition-opacity flex items-center space-x-2"
                >
                  <img
                    src="/google-icon.png"
                    alt="Google"
                    class="w-5 h-5"
                  />
                  <span>{Translations.menu.login}</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </nav>
      {LoggedIn && (
        <Sidebar 
          Translations={Translations}
          lang={lang}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      )}
    </>
  );
}
