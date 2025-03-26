import { Translations } from "../types/translations.ts";

interface CarouselProps {
    Translations: Translations;
}



export default function Carousel({ Translations }: CarouselProps) {
    return (
      <div class="void absolute inset-0 z-20 mx-auto aspect-square">
        <div class="crop">
          <ul id="card-list" style="--count: 3;" class="md:--count: 6;">
            <li>
              <div class="card bg-gray-800/80 backdrop-blur-sm rounded-lg shadow">
                <a href="" class="block">
                  <span class="model-name break-words">
                    {Translations.binu_characteristics.strategic_consulting}
                  </span>
                  <span class="break-words">
                    {Translations.binu_characteristics.strategic_consulting_description}
                  </span>
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
          <div class="last-circle hidden md:block"></div>
          <div class="second-circle hidden md:block"></div>
        </div>
        <div class="mask">
          
        </div>
        <div class="center-circle"></div>
      </div>
    );
  }