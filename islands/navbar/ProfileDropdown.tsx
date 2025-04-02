import { useState, useEffect } from "preact/hooks";
import { Translations } from "../../types/translations.ts";

interface ProfileDropdownProps {
  userInfo: {
    name?: string;
    email?: string;
    picture?: string;
  };
  Translations: Translations;
  lang: string;
}

export default function ProfileDropdown({ userInfo, Translations, lang }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localUserInfo, setLocalUserInfo] = useState(userInfo);
  const [imageError, setImageError] = useState(false);

  // Save user info to localStorage when it changes
  useEffect(() => {
    if (userInfo.name || userInfo.email || userInfo.picture) {
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      setLocalUserInfo(userInfo);
    }
  }, [userInfo]);

  // Load user info from localStorage on component mount
  useEffect(() => {
    const savedUserInfo = localStorage.getItem('userInfo');
    if (savedUserInfo) {
      try {
        const parsedUserInfo = JSON.parse(savedUserInfo);
        setLocalUserInfo(parsedUserInfo);
      } catch (error) {
        console.error('Error parsing user info from localStorage:', error);
      }
    }
  }, []);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div class="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
      >
        <img
          src={imageError || !localUserInfo.picture ? "/default-avatar.svg" : localUserInfo.picture}
          alt="Profile"
          class="w-10 h-10 rounded-full"
          onError={handleImageError}
        />
        <div class="hidden md:block text-left">
          <div class="text-sm font-medium">{localUserInfo.name || "User"}</div>
        </div>
      </button>

      {isOpen && (
        <div class="absolute right-0 mt-2 w-72 bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg py-2 z-50">
          <div class="px-4 py-3 border-b border-gray-700">
            <div class="flex items-center space-x-3">
              <img
                src={imageError || !localUserInfo.picture ? "/default-avatar.svg" : localUserInfo.picture}
                alt="Profile"
                class="w-12 h-12 rounded-full"
                onError={handleImageError}
              />
              <div>
                <div class="text-sm font-medium">{localUserInfo.name || "User"}</div>
                <div class="text-xs text-gray-400">{localUserInfo.email}</div>
              </div>
            </div>
          </div>
          
          <a
            href={`/account/logout?lang=${lang}`}
            class="block px-4 py-2 text-sm text-red-400 hover:bg-gray-700/50 transition-colors"
          >
            {Translations.menu.logout}
          </a>
        </div>
      )}
    </div>
  );
} 