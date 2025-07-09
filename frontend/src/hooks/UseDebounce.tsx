import { Accessor, createEffect, createSignal, on, onCleanup } from "solid-js";

// https://dev.to/aderchox/lets-learn-solidjs-quickly-by-creating-a-usedebounce-hook-3hf0
export function useDebounce(signal: Accessor<any>, delay: number) {
  const [debouncedSignal, setDebouncedSignal] = createSignal(signal());
  let timerHandle: NodeJS.Timeout;
  createEffect(
    on(signal, (s) => {
      timerHandle = setTimeout(() => {
        setDebouncedSignal(s);
      }, delay);
      onCleanup(() => clearTimeout(timerHandle));
    })
  );
  return debouncedSignal;
}
