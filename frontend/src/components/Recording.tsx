import { createEffect, createSignal, Setter, Show } from "solid-js";
import { Portal } from "solid-js/web";
import "./Recording.css";
import { TAthleteData } from "~/lib/types";
import { action, useSubmission } from "@solidjs/router";

const addRecording = action(async (formData: FormData) => {
  "use server";
  const res = await fetch(`${process.env.API}/files/upload`, {
    method: "POST",
    headers: {Authorization: process.env.API_KEY},
    body: formData,
  });
  if (res.ok) {
    const body = (await res.json()) as string;
    return { message: "Recording uploaded", id: body };
  }
  throw Error("Something went wrong...");
}, "addRecording");

export default function Recording(props: {
  details: TAthleteData;
  open: boolean;
  setOpen: Setter<boolean>;
  addToMyRecordings: (id: string) => void;
  myRecordings: string[];
}) {
  let recordBtn;
  let stopBtn;
  let audioRef;
  let audioInputRef;
  let chunks: BlobPart[] = [];
  const [stream, setStream] = createSignal<MediaStream>();
  const [audioURL, setAudioURL] = createSignal<string>();
  const [isRecording, setIsRecording] = createSignal(false);
  const [isPlaying, setIsPlaying] = createSignal(false);
  const [userName, setUserName] = createSignal("");
  const [blockClose, setBlockClose] = createSignal(false);
  const submission = useSubmission(addRecording);
  createEffect(() => {
    if (!props.open) return;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      console.log("getUserMedia supported.");

      navigator.mediaDevices
        .getUserMedia({ audio: true })

        // Success callback
        .then((stream) => {
          record(stream);
        })

        // Error callback
        .catch((err) => {
          console.error(`The following getUserMedia error occurred: ${err}`);
        });
    }
  });

  function record(stream: MediaStream) {
    setStream(stream);
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

    recordBtn!.onclick = function () {
      setIsRecording(true);
      mediaRecorder.start();
      console.log("Recorder started.");
      setTimeout(() => mediaRecorder.stop(), 5000);
    };

    stopBtn!.onclick = function () {
      mediaRecorder.stop();
    };
    mediaRecorder.onstop = function (e) {
      console.log("Recorder stopped.");
      const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
      // programmatically add file to the <input> element
      // https://stackoverflow.com/questions/71200356/send-recorded-video-using-getusermedia-through-form-without-using-formdata
      const file = new File(chunks, "f.webm", { type: "audio/webm" });
      const dt = new DataTransfer();
      dt.items.add(file);
      audioInputRef!.files = dt.files;

      chunks = [];
      setAudioURL(window.URL.createObjectURL(blob));
      setIsRecording(false);
    };

    mediaRecorder.ondataavailable = function (e) {
      chunks.push(e.data);
    };
  }

  function closeStream() {
    stream()
      ?.getTracks()
      .forEach((t) => t.stop());
    setStream();
  }

  function closeDialog() {
    if (blockClose()) return;
    submission.clear();
    closeStream();
    props.setOpen(false);
  }

  createEffect(() => {
    if (submission.result) {
      props.addToMyRecordings(submission.result?.id);
      setBlockClose(false);
      closeDialog();
    } else if (submission.error) {
      setBlockClose(false);
    } else if (submission.pending) {
      setBlockClose(true);
    }
  });
  return (
    <Portal mount={document.getElementById("popup-container")!}>
      <div
        class="recording-backdrop"
        onClick={(e) => {
          if (e.target !== e.currentTarget) return;
          closeDialog();
        }}
      >
        <div class={audioURL() ? "hidden" : "recording-container"}>
          <div>Please record the pronunciation of the name</div>
          <div class="athlete-name">{props.details.displayName}</div>

          <button
            class={
              "recording-btn " + (isRecording() || audioURL() ? "hidden" : "")
            }
            disabled={isRecording() || audioURL() ? true : false}
            ref={recordBtn}
          >
            <div class="icon">
              {/* !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                <path d="M192 0C139 0 96 43 96 96l0 160c0 53 43 96 96 96s96-43 96-96l0-160c0-53-43-96-96-96zM64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40c0 89.1 66.2 162.7 152 174.4l0 33.6-48 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l72 0 72 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-48 0 0-33.6c85.8-11.7 152-85.3 152-174.4l0-40c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40c0 70.7-57.3 128-128 128s-128-57.3-128-128l0-40z" />
              </svg>
            </div>
            <div>Record</div>
          </button>
          <button
            class={"stop-btn " + (!isRecording() || audioURL() ? "hidden" : "")}
            disabled={!isRecording() || audioURL() ? true : false}
            ref={stopBtn}
          >
            <div class="icon">
              {/* !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                <path d="M0 128C0 92.7 28.7 64 64 64H320c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128z" />
              </svg>
            </div>
            <div>Stop</div>
          </button>
        </div>
        <div class={audioURL() ? "recording-container" : "hidden"}>
          <h2>Thank you!</h2>
          <div>You can review, discard, or upload your recording now.</div>
          <div>If you want, you can also enter your name.</div>
          <div class="input-container">
            <label class="floating" for="name">
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={userName()}
              oninput={(e) => setUserName(e.target.value)}
            />
          </div>
          <audio
            src={audioURL()}
            ref={audioRef}
            onPlay={() => setIsPlaying(true)}
            onEnded={() => setIsPlaying(false)}
          ></audio>
          <div class="controls">
            <button
              class="play-btn"
              onClick={() => audioRef!.play()}
              disabled={isPlaying()}
            >
              <div class="icon">
                {/* !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                  <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z" />
                </svg>
              </div>
              <div>Play</div>
            </button>
            <button
              class="discard-btn"
              onClick={() => {
                submission.clear();
                setAudioURL();
              }}
              disabled={isPlaying()}
            >
              <div class="icon">
                {/* !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                  <path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0L284.2 0c12.1 0 23.2 6.8 28.6 17.7L320 32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 96C14.3 96 0 81.7 0 64S14.3 32 32 32l96 0 7.2-14.3zM32 128l384 0 0 320c0 35.3-28.7 64-64 64L96 512c-35.3 0-64-28.7-64-64l0-320zm96 64c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16z" />
                </svg>
              </div>
              <div>Discard</div>
            </button>
            <form
              action={addRecording}
              enctype="multipart/form-data"
              method="post"
            >
              <div style={{ display: "none" }}>
                <input
                  type="file"
                  name="recording"
                  id="recording"
                  accept="audio/webm"
                  ref={audioInputRef}
                />
                <input
                  type="text"
                  name="author"
                  id="author"
                  value={userName()}
                />
                <input
                  type="number"
                  name="athleteId"
                  id="athleteId"
                  value={props.details.id}
                />
              </div>
              <button
                type="submit"
                class="upload-btn"
                disabled={
                  isPlaying() ||
                  submission.pending ||
                  submission.result != undefined
                }
              >
                <div class="icon">
                  {/* !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                    <path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128l-368 0zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39L296 392c0 13.3 10.7 24 24 24s24-10.7 24-24l0-134.1 39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z" />
                  </svg>
                </div>
                <div>{submission.pending ? "Uploading..." : "Upload"}</div>
              </button>
            </form>
          </div>
          <Show when={submission.error}>
            <div class="error">{submission.error.message}</div>
          </Show>
        </div>
      </div>
    </Portal>
  );
}
