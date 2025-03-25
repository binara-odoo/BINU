import { Translations } from "../types/translations.ts";

interface CarouselProps {
    Translations: Translations;
}



export default function Carousel({ Translations }: CarouselProps) {
    return (
      <div class="void absolute inset-0 z-20 max-w-[1024px] mx-auto aspect-square">
        <div class="crop">
          <ul id="card-list" style="--count: 6;">
            <li>
              <div class="card  bg-gray-800/80 backdrop-blur-sm rounded-lg shadow">
                <a href="">
                  <span class="model-name">{ Translations.binu_characteristics.custom_training }</span>
                  <span>{ Translations.binu_characteristics.custom_training_description }</span>
                </a>
              </div>
            </li>

            <li>
              <div class="card  bg-gray-800/80 backdrop-blur-sm rounded-lg shadow">
                <a href="">
                  <span class="model-name">{ Translations.binu_characteristics.custom_development }</span>
                  <span>{ Translations.binu_characteristics.custom_development_description}</span>
                </a>
              </div>
            </li>

            <li>
              <div class="card  bg-gray-800/80 backdrop-blur-sm rounded-lg shadow">
                <a href="">
                  <span class="model-name">{ Translations.binu_characteristics.custom_training }</span>
                  <span>{ Translations.binu_characteristics.custom_training_description }</span>
                </a>
              </div>
            </li>
            {/* Repeat for other items */}
          </ul>
          <div class="last-circle"></div>
          <div class="second-circle"></div>
        </div>
        <div class="mask"></div>
        <div class="center-circle"></div>
      </div>
    );
  }