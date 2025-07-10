import { For, type Setter } from "solid-js";
import "./DisciplineFilter.css";
import { DISCIPLINES } from "~/lib/constants";
import { DOMElement } from "solid-js/jsx-runtime";
export default function DisciplineFilter(props: {
  filter: number[];
  setFilterFun: Setter<number[]>;
}) {
  const activateFilter = (
    e:
      | MouseEvent
      | (KeyboardEvent & {
          currentTarget: HTMLInputElement;
          target: DOMElement;
        }),
    invert?: boolean
  ) => {
    const checkbox = e.target as HTMLInputElement;
    const disc = parseInt(checkbox.value);
    const prevFilter = props.filter;
    let newFilter: number[];
    if ((checkbox.checked && !invert) || (!checkbox.checked && invert)) {
      prevFilter.push(disc);
      newFilter = [...prevFilter];
    } else {
      newFilter =
        prevFilter.length == 1 && prevFilter.includes(disc)
          ? Object.keys(DISCIPLINES).map((d) => parseInt(d))
          : prevFilter.filter((el) => el !== disc);
    }
    props.setFilterFun(newFilter);
  };
  return (
    <div id="discipline-filter">
      <For each={Object.entries(DISCIPLINES)}>
        {([k, v]) => (
          <div class="checkbox-container">
            <label
              for={v}
              class={props.filter.includes(parseInt(k)) ? "active " : ""}
            >
              <input
                type="checkbox"
                name={v}
                id={v}
                value={k}
                checked={props.filter.includes(parseInt(k))}
                onClick={activateFilter}
                onKeyPress={(e) => {
                  if (e.key !== "Enter") return;
                  activateFilter(e, true);
                }}
              />
              {v}
            </label>
          </div>
        )}
      </For>
    </div>
  );
}
