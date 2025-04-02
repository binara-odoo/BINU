import { Translations } from "../../types/translations.ts";

interface ApproachCarouselProps {
    Translations: Translations;
}

export default function ApproachCarousel({ Translations }: ApproachCarouselProps) {
    return (
        <div class="relative z-10 p-10 bg-black/70">
            <h2 class="text-center neon-text text-4xl font-bold relative z-20 mb-10">
                {Translations.approach.title}
            </h2>
            <div class="approach-container">
                <div class="approach-card">
                    <h3 class="approach-card-title">
                        { Translations.approach.in_depth_analysis }
                    </h3>
                    <div class="approach-card-bar">
                        <div class="approach-card-emptybar"></div>
                        <div class="approach-card-filledbar"></div>
                    </div>
                    <div class="approach-card-description">
                        {Translations.approach.in_depth_analysis_description}
                    </div>
                </div>

                <div class="approach-card">
                    <h3 class="approach-card-title">
                        {Translations.approach.efficient_implementation}
                    </h3>
                    <div class="approach-card-bar">
                        <div class="approach-card-emptybar"></div>
                        <div class="approach-card-filledbar"></div>
                    </div>
                    <div class="approach-card-description">
                        {Translations.approach.efficient_implementation_description }
                    </div>
                </div>

                <div class="approach-card">
                    <h3 class="approach-card-title">
                        {Translations.approach.continuing_training }
                    </h3>
                    <div class="approach-card-bar">
                        <div class="approach-card-emptybar"></div>
                        <div class="approach-card-filledbar"></div>
                    </div>
                    <div class="approach-card-description">
                        {Translations.approach.continuing_training_description }
                    </div>
                </div>

                <div class="approach-card">
                    <h3 class="approach-card-title">
                        {Translations.approach.support_and_evolution}
                    </h3>
                    <div class="approach-card-bar">
                        <div class="approach-card-emptybar"></div>
                        <div class="approach-card-filledbar"></div>
                    </div>
                    <div class="approach-card-description">
                        {Translations.approach.support_and_evolution_description}
                    </div>
                </div>
            </div>
        </div>
    );
}