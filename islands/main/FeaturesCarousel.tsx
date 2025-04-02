import { Translations } from "../../types/translations.ts";

interface FeaturesCarouselProps {
    Translations: Translations;
}

export default function FeaturesCarousel( { Translations} : FeaturesCarouselProps){
    return (
        <div class="relative z-10 p-10 bg-black/70">
            <h1 class="text-center neon-text text-4xl font-bold relative z-20 mb-10">
                { Translations.engagement_word.title }
            </h1>
            <h2 class="text-center neon-text text-2xl font-bold relative z-20 mb-10">
                {Translations.binu_characteristics.subtitle}
            </h2>
            <div class="features-container">
                <div class="features-card">
                    <h3 class="features-card-title-1">
                        { Translations.binu_characteristics.strategic_consulting }
                    </h3>
                    <div class="features-card-bar">
                        <div class="features-card-emptybar"></div>
                        <div class="features-card-filledbar-1"></div>
                    </div>
                    <div class="features-card-description">
                        { Translations.binu_characteristics.strategic_consulting_description }
                    </div>
                </div>

                <div class="features-card">
                    <h3 class="features-card-title-2">
                        { Translations.binu_characteristics.custom_training }
                    </h3>
                    <div class="features-card-bar">
                        <div class="features-card-emptybar"></div>
                        <div class="features-card-filledbar-2"></div>
                    </div>
                    <div class="features-card-description">
                        { Translations.binu_characteristics.custom_training_description }
                    </div>
                </div>

                <div class="features-card">
                    <h3 class="features-card-title-3">
                        { Translations.binu_characteristics.custom_development }
                    </h3>
                    <div class="features-card-bar">
                        <div class="features-card-emptybar"></div>
                        <div class="features-card-filledbar-3"></div>
                    </div>
                    <div class="features-card-description">
                        { Translations.binu_characteristics.custom_development_description}
                    </div>
                </div>

            </div>
        </div>
    );
}