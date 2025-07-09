import { For, type Accessor, type Setter } from "solid-js";
import "./DisciplineFilter.css";
import { DISCIPLINES } from "~/lib/constants";
export default function DisciplineFilter(props: {
  filter: Accessor<number[]>;
  setFilterFun: Setter<number[]>;
}) {
  return (
    <div id="discipline-filter">
      <For each={Object.entries(DISCIPLINES)}>
        {([k, v]) => (
          <div class="checkbox-container">
            <input
              type="checkbox"
              name={v}
              id={v}
              value={k}
              checked={props.filter().includes(parseInt(k))}
              onClick={(e) => {
                const checkbox = e.target as HTMLInputElement;
                const disc = parseInt(checkbox.value);
                const prevFilter = props.filter();
                let newFilter: number[];
                if (checkbox.checked) {
                  prevFilter.push(disc);
                  newFilter = [...prevFilter];
                } else {
                  newFilter =
                    prevFilter.length == 1 && prevFilter.includes(disc)
                      ? Object.keys(DISCIPLINES).map((d) => parseInt(d))
                      : prevFilter.filter((el) => el !== disc);
                }
                props.setFilterFun(newFilter);
              }}
            />
            <label for={v}>{v}</label>
          </div>
        )}
      </For>
    </div>
  );
}
