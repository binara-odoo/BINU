import { useSignal } from "@preact/signals";
import { Translations } from "../types/translations.ts";

interface Carousel2Props {
    Translations: Translations;
}
export default function Carousel2({ Translations }: Carousel2Props) {
  const selectedItem = useSignal("1");

  return (
    <div class="relative my-20 z-10 mb-48">
      <h1 class="text-center neon-text text-4xl font-bold mb-10 relative z-20">
        {Translations.engagement_word.title}
      </h1>
      <div class="carousel-container">
        <input
          type="radio"
          name="slider"
          id="item-1"
          checked={selectedItem.value === "1"}
          onChange={() => selectedItem.value = "1"}
        />
        <input
          type="radio"
          name="slider"
          id="item-2"
          checked={selectedItem.value === "2"}
          onChange={() => selectedItem.value = "2"}
        />
        <input
          type="radio"
          name="slider"
          id="item-3"
          checked={selectedItem.value === "3"}
          onChange={() => selectedItem.value = "3"}
        />

        <div class="cards">
          <label class="card" for="item-1" id="song-1">
            <img src="/custom_development.png" alt="Custom Development" />
          </label>
          <label class="card" for="item-2" id="song-2">
            <img src="/custom_training.png" alt="Custom Training" />
          </label>
          <label class="card" for="item-3" id="song-3">
            <img src="/strategic_consulting2.png" alt="Strategic Consulting" />
          </label>
        </div>

        <div class="player">
          <div class="upper-part">
            <div class="play-icon">
              <svg
                width="20"
                height="20"
                fill="#2992dc"
                stroke="#2992dc"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                class="feather feather-play"
                viewBox="0 0 24 24"
              >
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
            </div>
            <div class="info-area">
              <label class="song-info">
                <div class="title">{Translations.binu_characteristics.custom_development}</div>
                <div class="sub-line">
                  <div class="subtitle">Binu Services</div>
                  <div class="time">01</div>
                </div>
              </label>
              <label class="song-info">
                <div class="title">{Translations.binu_characteristics.custom_training}</div>
                <div class="sub-line">
                  <div class="subtitle">Binu Services</div>
                  <div class="time">02</div>
                </div>
              </label>
              <label class="song-info">
                <div class="title">{Translations.binu_characteristics.strategic_consulting}</div>
                <div class="sub-line">
                  <div class="subtitle">Binu Services</div>
                  <div class="time">03</div>
                </div>
              </label>
            </div>
          </div>
          <div class="progress-bar">
            <span class="progress"></span>
          </div>
        </div>
      </div>
    </div>
  );
}
