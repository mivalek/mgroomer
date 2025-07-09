import { For } from "solid-js";
import "./Rating.css";

export default function Rating(props: {
  id: string;
  rating: number;
  nRatings: number;
}) {
  return (
    <div class="rating-container">
      <For each={[1, 2, 3, 4, 5]}>
        {(n) => (
          <div class="rating">
            {/* !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="-50 -50 676 612">
              <defs>
                <clipPath id={`${props.id}_${n}`}>
                  <rect
                    x="50"
                    y="0"
                    width={`${
                      (props.rating >= n // if yes, star should be full
                        ? 1
                        : props.rating % (n - 1) > 1 // if yes, star should be empty
                        ? 0
                        : props.rating % 1) * 500
                    }`}
                    height="662"
                  />
                </clipPath>
              </defs>
              <path
                d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"
                clip-path={`url(#${props.id}_${n}`}
              />
              <path
                class="outline"
                d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"
              />
            </svg>
          </div>
        )}
      </For>
      <div class="n-ratings ">({props.nRatings})</div>
    </div>
  );
}
