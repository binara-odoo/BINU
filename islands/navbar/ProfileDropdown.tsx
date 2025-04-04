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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Reset error state when userInfo.picture changes
  useEffect(() => {
    if (userInfo?.picture) {
      setImageError(false);
      setImageLoaded(false);
    }
  }, [userInfo?.picture]);

  const handleImageError = (e: Event) => {
    const target = e.currentTarget as HTMLImageElement;
    setImageError(true);
    target.src = "/default-avatar.svg";
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const profileImage = imageError || !userInfo?.picture ? "/default-avatar.svg" : userInfo.picture;

  return (
    <div class="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        class="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
      >
        <div class="relative w-10 h-10">
          {!imageLoaded && !imageError && (
            <div class="absolute inset-0 bg-gray-700 rounded-full animate-pulse" />
          )}
          <img
            src={profileImage}
            alt="Profile"
            class={`w-10 h-10 rounded-full ${!imageLoaded && !imageError ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        </div>
        <div class="hidden md:block text-left">
          <div class="text-sm font-medium">{userInfo?.name || "User"}</div>
        </div>
      </button>

      {isOpen && (
        <div class="absolute right-0 mt-2 w-72 bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-lg py-2 z-50">
          <div class="px-4 py-3 border-b border-gray-700">
            <div class="flex items-center space-x-3">
              <div class="relative w-12 h-12">
                {!imageLoaded && !imageError && (
                  <div class="absolute inset-0 bg-gray-700 rounded-full animate-pulse" />
                )}
                <img
                  src={profileImage}
                  alt="Profile"
                  class={`w-12 h-12 rounded-full ${!imageLoaded && !imageError ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
              </div>
              <div>
                <div class="text-sm font-medium">{userInfo?.name || "User"}</div>
                <div class="text-xs text-gray-400">{userInfo?.email}</div>
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
