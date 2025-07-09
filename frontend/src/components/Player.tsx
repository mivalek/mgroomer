import { createSignal, Show } from "solid-js";
import "./Player.css";
import { query } from "@solidjs/router";

const getRecordingBlob = query(async (id: string) => {
  "use server";
  const resp = await fetch(`${process.env.FILE_SERVER}/audio/${id}.webm`, {
    method: "GET",
    headers: {Authorization: process.env.API_KEY}
  });

  if (resp.ok) return resp.arrayBuffer();
  throw Error("Something went wrong");
}, "getBlob");

export default function Player(props: {
  athleteId: number;
  recordingId: string;
  setHasPlayed: (id: string) => void;
}) {
  const [isPlaying, setIsPlaying] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  const [isError, setIsError] = createSignal(false);
  let audioRef;

  async function playRecording() {
    try {
      if (audioRef!.src === "") {
        setIsLoading(true);
        const buffer = await getRecordingBlob(props.recordingId);
        const blob = new Blob([buffer]);
        audioRef!.src = window.URL.createObjectURL(blob);
      }

      setIsPlaying(true);
      console.log("playing");

      audioRef!.play();
    } catch (e) {
      console.log(e);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div class="player">
      <audio
        ref={audioRef}
        onEnded={() => {
          setIsPlaying(false);
          props.setHasPlayed(props.recordingId);
        }}
      />
      <button
        class={isLoading() ? "loading-btn" : "play-btn"}
        onClick={() => playRecording()}
        disabled={isPlaying() || isLoading() || isError()}
      >
        <Show when={isLoading()}>
          <div>Loading...</div>
        </Show>
        <Show when={!isLoading()}>
          <div class="icon">
            {/* !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
              <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
            </svg>
          </div>
          <div>Play</div>
        </Show>
      </button>
    </div>
  );
}
