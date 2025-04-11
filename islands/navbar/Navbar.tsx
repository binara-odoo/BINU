import { Translations } from "../../types/translations.ts";
import LanguageDropdown from "./LanguageDropdown.tsx";
import { useState, useEffect } from "preact/hooks";
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
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  // Initialize theme from localStorage or default to light
  useEffect(() => {
    // Check if theme is already set in localStorage
    const savedTheme = localStorage.getItem('theme');
    
    // Only apply theme if it hasn't been initialized yet
    if (!document.documentElement.classList.contains('theme-initialized')) {
      if (savedTheme) {
        const isDark = savedTheme === 'dark';
        setIsDarkTheme(isDark);
        applyTheme(isDark);
      } else {
        // Default to light theme if no preference is stored
        setIsDarkTheme(false);
        applyTheme(false);
        localStorage.setItem('theme', 'light');
      }
    } else {
      // Just set the state based on the current theme
      setIsDarkTheme(document.documentElement.classList.contains('dark-theme'));
    }
  }, []);

  // Apply theme to body
  const applyTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
    } else {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark-theme');
    }
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    applyTheme(newTheme);
  };

  const loggedInMenu = [
    { name: Translations.menu.home, href: `/dashboard/dashboard?lang=${lang}` },
  ];

  const nonLoggedInMenu = [
    { name: Translations.menu.home, href: `/?lang=${lang}` },
  ];

  const menu = LoggedIn ? loggedInMenu : nonLoggedInMenu;

  console.log("userInfo:", userInfo);
  console.log("userInfo.picture:", userInfo?.picture);

  return (
    <>
      <nav class="w-full px-6 py-4 fixed top-0 left-0 z-50 bg-black backdrop-blur-sm">
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
              <source src="/dark_logo_binu.mp4" type="video/mp4" />
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

            {/* Theme toggle button */}
            <button 
              type="button"
              onClick={toggleTheme}
              class="p-2 rounded-full hover:bg-gray-800 transition-colors"
              aria-label={isDarkTheme ? "Switch to light theme" : "Switch to dark theme"}
            >
              {isDarkTheme ? (
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            

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
