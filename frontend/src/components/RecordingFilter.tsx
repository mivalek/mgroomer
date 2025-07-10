import { type Setter } from "solid-js";
import "./RecordingFilter.css";
export default function RecordingFilter(props: {
  filter: boolean;
  setFilterFun: Setter<boolean>;
}) {
  return (
    <div id="recording-filter">
      <label for="recording" class={props.filter ? "active " : ""}>
        <input
          type="checkbox"
          name="recording"
          id="recording"
          checked={props.filter}
          onClick={(e) => {
            const checkbox = e.target as HTMLInputElement;
            props.setFilterFun(checkbox.checked);
          }}
          onKeyPress={(e) => {
            if (e.key !== "Enter") return;
            const checkbox = e.target as HTMLInputElement;
            props.setFilterFun(!checkbox.checked);
          }}
        />
        only with audio
      </label>
    </div>
  );
}
