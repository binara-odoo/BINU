import { useSignal } from "@preact/signals";

interface LanguageDropdownProps {
  languages: { code: string; name: string }[];
  currentLang: string;
  menuText: string;
}

export default function LanguageDropdown({ languages, currentLang, menuText }: LanguageDropdownProps) {
  const showMenu = useSignal(false);

  // Filter out the current language from options
  // const availableLanguages = languages.filter(lang => lang.code !== currentLang);

  return (
    <div class="relative inline-block">
      <button
        type="button"
        onClick={() => {
          showMenu.value = !showMenu.value;
          console.log("Current language:", currentLang);
        }}
        class="text-sm hover:opacity-75 transition-opacity flex items-center gap-1"
      >
        {/* Show current language name instead of generic menu text */}
        { menuText }
        {/*<svg class={`w-4 h-4 transition-transform ${showMenu.value ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>*/}
      </button>
      {showMenu.value && (
        <div class="absolute top-full right-0 mt-2 py-2 w-32 bg-black/90 backdrop-blur-sm rounded-lg shadow-lg">
          {languages.map((language) => (
            <a
              key={language.code}
              href={`?lang=${language.code}`}
              class="block px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
            >
              {language.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}