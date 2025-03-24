import { Handlers, PageProps} from "$fresh/server.ts";
import { Translations } from "../types/translations.ts";
import { LoadTranslations } from "../utils/i18n.ts";
import PagesBackground from "../components/PagesBackground.tsx";
import Navbar from "../components/Navbar.tsx";

interface SigninProps {
    LoggedIn: boolean;
    Translations: Translations;
    lang: string;
}

export const handler: Handlers<SigninProps> = {
    async GET(req, ctx) {
        const url = new URL(req.url);
        const lang = url.searchParams.get("lang") || "es";
        const translations = await LoadTranslations(lang);

        return ctx.render({
            LoggedIn: false,
            Translations: translations,
            lang: lang
        });
    },
};

export default function Signin({ data }: PageProps<SigninProps> ){
    return (
        <div class = "relative min-h-screen"> 
            <PagesBackground>
                <div class = "relative z-10 min-h-screen bg-black/40 text-white">
                    <Navbar 
                        LoggedIn = { data.LoggedIn}
                        Translations = { data.Translations }
                        lang = { data.lang}
                    />
                    <section class = "flex flex-col items-center justify-center min-h-screen px-y">
                        <div class = "mx-auto mb-10">
                            <h2 class = "text-white text-4xl font-bold text-center">
                                { data.Translations.register.title }
                            </h2>
                        </div>

                        <div class = "w-full bg-gray-800/80 backdrop-blur-sm rounded-g shadow md:mt-0 sm:max-w-md xl:p-0">
                        <div class = "p-6 space-y-4 md:space-y-6 sm:p-8">
                            <form class = "space-y-4 md:space-y-6">
                                <div>
                                    <label
                                        htmlFor = "email"
                                        class = "block mb-2 text-sm font-medium text-white dark:text-white"
                                    >
                                        { data.Translations.register.email }
                                    </label>
                                    <input 
                                        type = "email"
                                        name = "email"
                                        id = "email"
                                        class = "bg-gray-t0 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-flull p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder = { data.Translations.register.email_placeholder }
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor = "confirm_email"
                                        class = "block mb-2 text-sm font-medium text-white dark:text-white"
                                    >
                                        { data.Translations.register.confirm_email }
                                    </label>
                                    <input 
                                        type = "email"
                                        name = "confirm_email"
                                        id = "confirm_email"
                                        class = "bg-gray-t0 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-flull p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder = { data.Translations.register.email_placeholder }
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor = "password"
                                        class = "block mb-2 text-sm font-medium text-white dark:text-white"
                                    >
                                        { data.Translations.register.password }
                                    </label>
                                    <input 
                                        type = "email"
                                        name = "email"
                                        id = "email"
                                        class = "bg-gray-t0 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-flull p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder = { data.Translations.register.email_placeholder }
                                    />
                                </div>
                            </form>
                        </div>
                        </div>
                    </section>
                </div>
            </PagesBackground>
        </div>
    )
}
