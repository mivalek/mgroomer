import { createEffect, createSignal, For, Show } from "solid-js";
import "./Card.css";

import type { TAthleteData, TStore, TRecording } from "~/lib/types";
import {
  addRecordingToLocalStorage,
  getInitials,
  setRatingInLocalStorage,
} from "~/lib/utils";
import Recording from "./Recording";
import Player from "./Player";
import NameForm from "./NameForm";
import Rating from "./Rating";
import MyRating from "./MyRating";
import { type SetStoreFunction } from "solid-js/store";
import { DISCIPLINES } from "~/lib/constants";
import DeleteRecording from "./DeleteRecording";

export default function Card(props: {
  details: TAthleteData;
  recordings: TRecording[];
  isAdmin: boolean;
  store: TStore;
  setStore: SetStoreFunction<TStore>;
  storesLoaded: boolean;
}) {
  let detailsRef;
  const [recOpen, setRecOpen] = createSignal(false);

  function markedPlayed(id: string) {
    props.setStore("played", id, true);
  }
  createEffect(() =>
    recOpen()
      ? document.body.classList.add("noscroll")
      : document.body.classList.remove("noscroll")
  );

  function closeDetails() {
    detailsRef!.removeAttribute("open");
  }

  function markAsRated(id: string, rating: number, remove: boolean) {
    setRatingInLocalStorage(id, rating, remove);
    if (remove) {
      props.setStore("rating", id, undefined);
      return;
    }
    props.setStore("rating", id, rating);
  }

  function addToMyRecordings(id: string) {
    props.setStore("myRecordings", props.store.myRecordings.length, id);
    addRecordingToLocalStorage(id);
  }

  function isInMyRecordings(id: string) {
    return props.store.myRecordings.includes(id);
  }

  return (
    <details class={"card " + (props.details.category === 1 ? "col-1" : "col-2")} name="card" ref={detailsRef}>
      <summary>
        <div class="avatar-container">
          <img
            class="avatar"
            loading="lazy"
            src={
              props.details.hasPic
                ? `${import.meta.env.VITE_PUBLIC_FILE_SERVER}/img/${
                    props.details.id
                  }.webp`
                : ""
            }
            alt={getInitials(props.details)}
            width={100}
            height={100}
          />
          <img
            src={`https://images.ifsc-climbing.org/ifsc/image/private/t_q-best/prd/assets/flags/${props.details.country}.svg`}
            alt=""
            class="flag"
          />
        </div>
        <div>
          <Show when={props.isAdmin === true}>
            <NameForm
              id={props.details.id}
              displayName={props.details.displayName}
            />
          </Show>
          <Show when={props.isAdmin === false}>
            <div>{props.details.displayName}</div>
          </Show>
          <div class="discipline">
            <For each={Object.keys(DISCIPLINES)}>
              {(i) => (
                <Show when={props.details.discipline & +i}>
                  <div>{DISCIPLINES[+i as keyof typeof DISCIPLINES]}</div>
                </Show>
              )}
            </For>
          </div>
        </div>
      </summary>
      <div
        class="content"
        onClick={(e) => {
          if (e.target !== e.currentTarget) return;
          e.stopPropagation();
          closeDetails();
        }}
      >
        <Show when={props.details.hasRecording}>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <td></td>
                  <td>Recording</td>
                  <td>Author</td>
                  <td>Rating</td>
                  <td></td>
                </tr>
              </thead>
              <tbody>
                <For each={props.recordings}>
                  {(r, i) => (
                    <tr>
                      <td>{i() + 1}</td>
                      <td>
                        <Player
                          athleteId={props.details.id}
                          recordingId={r.id}
                          setHasPlayed={markedPlayed}
                        />
                      </td>
                      <td class="author">
                        {isInMyRecordings(r.id)
                          ? "you"
                          : r.author.length
                          ? r.author
                          : "anon"}
                      </td>
                      <td class="rating-row">
                        <Rating
                          id={r.id}
                          rating={r.rating * 5}
                          nRatings={r.nRatings}
                        />
                      </td>
                      <td class="user-action">
                        <Show
                          when={
                            props.storesLoaded &&
                            !isInMyRecordings(r.id) &&
                            !props.isAdmin
                          }
                        >
                          <MyRating
                            id={r.id}
                            rating={props.store.rating[r.id]}
                            ratingFun={(rating, remove) =>
                              markAsRated(r.id, rating, remove)
                            }
                          />
                        </Show>
                        <Show when={isInMyRecordings(r.id) || props.isAdmin}>
                          <DeleteRecording
                            id={r.id}
                            addToMyRecordings={addToMyRecordings}
                          />
                        </Show>
                      </td>
                      {/* <td
                        class={
                          "report " +
                          (props.store.played[r.id] ||
                          isInMyRecordings(r.id) ||
                          props.isAdmin
                            ? ""
                            : " hidden ")
                        }
                      >                        
                        <Show
                          when={
                            props.store.played[r.id] ||
                            props.store.flagged.includes(r.id) ||
                            props.isAdmin
                          }
                        >
                          <FlagRec
                            id={r.id}
                            isFlagged={r.flag}
                            addToMyFlags={addToMyFlags}
                            isMine={props.store.flagged.includes(r.id)}
                          />
                        </Show>
                      </td> */}
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </Show>
        <Show when={!props.details.hasRecording}>
          <div>No recording yet</div>
        </Show>
        <button class="add-recording" onClick={() => setRecOpen(true)}>
          <div class="icon">
            {/* !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z" />
            </svg>
          </div>
          Add
        </button>
        <Show when={recOpen()}>
          <Recording
            details={props.details}
            open={recOpen()}
            setOpen={setRecOpen}
            addToMyRecordings={addToMyRecordings}
            myRecordings={props.store.myRecordings}
          ></Recording>
        </Show>
      </div>
    </details>
  );
}
