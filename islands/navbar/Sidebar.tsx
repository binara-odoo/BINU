import { Translations } from "../../types/translations.ts";
import { useState, useEffect } from "preact/hooks";

interface SidebarProps {
  Translations: Translations;
  lang: string;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ Translations, lang, isOpen, onToggle }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);

  // Handle window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(globalThis.innerWidth < 640); // sm breakpoint
    };

    checkMobile();
    globalThis.addEventListener('resize', checkMobile);
    return () => globalThis.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!isMobile) return; // Don't add click outside listener on desktop

    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      const logoButton = document.getElementById('logo-button');
      if (isOpen && sidebar && logoButton && 
          !sidebar.contains(event.target as Node) && 
          !logoButton.contains(event.target as Node)) {
        onToggle();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isMobile, onToggle]);

  const dashboardItems = [
    {
      title: Translations.dashboard.calendar,
      icon: "/dashboardIcons/calendar.gif",
      href: `/calendar?lang=${lang}`,
    },
    {
      title: Translations.dashboard.information,
      icon: "/dashboardIcons/information.gif",
      href: `/information?lang=${lang}`,
    },
    {
      title: Translations.dashboard.contacts,
      icon: "/dashboardIcons/contacts.gif",
      href: `/contacts?lang=${lang}`,
    },
    {
      title: Translations.dashboard.sales,
      icon: "/dashboardIcons/sales.gif",
      href: `/sales?lang=${lang}`,
    },
    {
      title: Translations.dashboard.documents,
      icon: "/dashboardIcons/documents.gif",
      href: `/documents?lang=${lang}`,
    },
    {
      title: Translations.dashboard.projects,
      icon: "/dashboardIcons/projects.gif",
      href: `/projects?lang=${lang}`,
    },
    {
      title: Translations.dashboard.evaluations,
      icon: "/dashboardIcons/evaluations.gif",
      href: `/evaluations?lang=${lang}`,
    },
    {
      title: Translations.dashboard.specs,
      icon: "/dashboardIcons/specs.gif",
      href: `/specs?lang=${lang}`,
    }
  ];

  return (
    <aside
      id="sidebar"
      class={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
      aria-label="Sidebar"
    >
      <div class="h-full px-3 py-4 overflow-y-auto bg-black/80 backdrop-blur-sm relative">
        {/* Close button */}
        <button
          id="sidebar-close"
          type="button"
          onClick={onToggle}
          class={`absolute top-2 right-2 p-2 text-gray-400 hover:text-white rounded-lg ${
            isMobile ? '' : 'hidden'
          }`}
        >
        </button>

        <ul class="space-y-2 font-medium mt-24">
          {dashboardItems.map((item) => (
            <li key={item.title}>
              <a
                href={item.href}
                onClick={() => isMobile && onToggle()}
                class="flex items-center p-2 text-white rounded-sm hover:bg-gray-700/50 group relative transition-all duration-300 hover:transform hover:-translate-y-1"
              >
                <div class="absolute top-0 left-1/2 w-0.5 h-0.5 rounded-sm transition-all duration-400 group-hover:w-[calc(100%+4px)] group-hover:h-[calc(100%+4px)] group-hover:top-[-2px] group-hover:left-[-2px] group-hover:bg-transparent group-hover:border-2 group-hover:border-[#4DA6FF] group-hover:shadow-[0_0_15px_#4DA6FF,0_0_20px_#1E90FF,0_0_30px_#0047AB]"></div>
                <img
                  src={item.icon}
                  alt={item.title}
                  class="w-5 h-5 text-[#B4E3FF] group-hover:text-[#B4E3FF] transition duration-75"
                />
                <span class="flex-1 ms-3 whitespace-nowrap text-[#B4E3FF] font-medium">{item.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}