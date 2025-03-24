export default function Carousel() {
    return (
      <div class="void absolute inset-0 z-20 max-w-[1024px] mx-auto aspect-square">
        <div class="crop">
          <ul id="card-list" style="--count: 6;">
            <li>
              <div class="card">
                <a href="">
                  <span class="model-name">Gretel-ACTGAN</span>
                  <span>Model for generating highly dimensional, mostly numeric, tabular data</span>
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