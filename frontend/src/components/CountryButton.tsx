import { Setter } from "solid-js";
import { codeToCountry } from "~/lib/utils";
import "./CountryButton.css";

export default function CountryButton(props: {
  code: string;
  setCountryFilter: Setter<string | undefined>;
  setSearchQuery: Setter<string>;
}) {
  return (
    <button
      class="country-button"
      onclick={() => {
        props.setCountryFilter(props.code);
        props.setSearchQuery("");
      }}
    >
      <img
        src={`https://images.ifsc-climbing.org/ifsc/image/private/t_q-best/prd/assets/flags/${props.code}.svg`}
        alt=""
        class="flag"
      />
      {codeToCountry(props.code)}
    </button>
  );
}
