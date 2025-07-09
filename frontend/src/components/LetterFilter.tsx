import { For, Setter, Show } from "solid-js";
import "./LetterFilter.css";

export default function LetterFilter(props: {
  isActive: boolean;
  filter: string | undefined;
  setFilter: Setter<string | undefined>;
}) {
  const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");
  function pickLetter(l: string) {
    props.setFilter((prev) => (prev === l ? undefined : l));
  }

  return (
    <div id="letter-filter">
      <Show when={props.isActive}>
        <div class="wide">
          <For each={LETTERS}>
            {(l) => (
              <div
                class={"letter " + (props.filter === l ? " active " : "")}
                onClick={() => pickLetter(l)}
              >
                <label for={`letter-${l}`}>
                  {l}
                  <input
                    checked={props.filter == l}
                    type="radio"
                    name={`letter-${l}`}
                    onKeyPress={(e) => {
                      if (e.key !== "Enter") return;
                      pickLetter(l);
                    }}
                  ></input>
                </label>
              </div>
            )}
          </For>
        </div>
        <div class="narrow">
          <select
            class="current"
            onChange={(e) =>
              props.setFilter(
                e.target.value === "all" ? undefined : e.target.value
              )
            }
          >
            <option value="all" selected={props.filter === undefined}>
              {"All"}
            </option>
            <For each={LETTERS}>
              {(l) => (
                <option value={l} selected={props.filter === l}>
                  {l.toUpperCase()}
                </option>
              )}
            </For>
          </select>
        </div>
      </Show>
    </div>
  );
}
