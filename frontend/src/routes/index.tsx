import {
  createEffect,
  createMemo,
  createSignal,
  ErrorBoundary,
  For,
  onMount,
  Show,
  Suspense,
} from "solid-js";
import Card from "~/components/Card";
import Search from "~/components/Search";
import {
  codeToCountry,
  getLocalStorage,
  matchCountries,
  sortByRating,
} from "~/lib/utils";
import CountryButton from "~/components/CountryButton";
import CountryFilter from "~/components/CountryFilter";
import type {
  TAthleteData,
  TLocalStorage,
  TRecording,
  TStore,
} from "~/lib/types";
import {
  createAsyncStore,
  query,
  useLocation,
  type RouteDefinition,
  createAsync,
} from "@solidjs/router";
import { useDebounce } from "~/hooks/UseDebounce";
import Footer from "~/components/Footer";
import DisciplineFilter from "~/components/DisciplineFilter";
import { DISCIPLINES } from "~/lib/constants";
import LetterFilter from "~/components/LetterFilter";
import { createStore } from "solid-js/store";
import Intro from "~/components/Intro";
import RecordingFilter from "~/components/RecordingFilter";

const getAthletes = query(async () => {
  "use server";
  const response = await fetch(`${process.env.API}/athletes`, {
    method: "GET",
    headers: { Authorization: process.env.API_KEY },
  });
  const data = (await response.json()) as TAthleteData[];
  data.sort((a, b) =>
    [a.familyNames.split(" ").at(-1), a.givenNames].join(" ") >
    [b.familyNames.split(" ").at(-1), b.givenNames].join(" ")
      ? 1
      : -1
  );
  data.forEach((_, i) => {
    // for faster sorting
    data[i].nameRank = i;
  });
  return data;
}, "athletes");

const getRecordings = query(async () => {
  "use server";
  const response = await fetch(`${process.env.API}/files`, {
    method: "GET",
    headers: { Authorization: process.env.API_KEY },
  });
  const data = (await response.json()) as TRecording[];
  const recordings = new Map<number, TRecording[]>();
  const authors = new Map<string, number>();
  data.forEach((d) => {
    if (!recordings.has(d.athleteId)) {
      recordings.set(d.athleteId, []);
    }
    recordings.get(d.athleteId)?.push(d);
    if (d.author !== "") {
      if (!authors.has(d.author)) {
        authors.set(d.author, 0);
      }
      authors.set(d.author, authors.get(d.author)! + 1);
    }
  });
  return { recordings, authors };
}, "recordings");

const verifyAdmin = query(async (x: string) => {
  "use server";
  const resp = (await x) === process.env.ADMIN;
  return resp;
}, "verifyAdmin");

export const route = {
  preload: () => {
    getAthletes();
  },
} satisfies RouteDefinition;

export default function Home() {
  const location = useLocation();
  const athleteData = createAsyncStore(() => getAthletes());
  const recData = createAsyncStore(() => getRecordings());
  const isAdmin = createAsync(() =>
    verifyAdmin(location.query.admin as string)
  );

  const [store, setStore] = createStore<TStore>({
    played: {},
    rating: {},
    flagged: [],
    myRecordings: [],
  });
  const [storesLoaded, setStoresLoaded] = createSignal(false);
  const [searchQuery, setSearchQuery] = createSignal<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [disciplineFilter, setDisciplineFilter] = createSignal(
    Object.keys(DISCIPLINES).map((d) => parseInt(d))
  );
  const [recordingFilter, setRecordingFilter] = createSignal(false);
  const [letterFilter, setLetterFilter] = createSignal<string | undefined>("a");
  const [isFilteringByLetter, setIsFilteringByLetter] = createSignal(true);
  const matchingCountries = () => {
    const q = debouncedSearchQuery().toLowerCase();
    if (q.length < 3) return [];
    let out = matchCountries(q, [...available().countries]);
    if (
      q.length === 3 &&
      available().countries.has(q) &&
      !out.includes(q.toUpperCase())
    ) {
      out.push(q.toUpperCase());
    }
    return out.toSorted();
  };

  const matchingNames = () => {
    if (!athleteData()) return [];
    let names = athleteData()!.map((d) => d.familyNames + " " + d.givenNames);
    if (debouncedSearchQuery().length > 1) {
      names = names.filter((n) =>
        n
          .toLowerCase()
          .split(" ")
          .some((nn) => nn.startsWith(debouncedSearchQuery().toLowerCase()))
      );
    }
    return names;
  };
  const [countryFilter, setCountryFilter] = createSignal<string>();

  const filteredData = createMemo(() => {
    if (athleteData() === undefined) {
      return [];
    }

    return athleteData()!
      .filter(
        (d) =>
          disciplineFilter().some((disc) => disc & d.discipline) &&
          (!recordingFilter() || d.hasRecording) &&
          (letterFilter() && isFilteringByLetter()
            ? d.familyNames.split(" ").at(-1)?.startsWith(letterFilter()!)
            : true) &&
          d.country.includes(countryFilter() || "") &&
          matchingNames().includes(d.familyNames + " " + d.givenNames)
      )
      .toSorted((a, b) => a.nameRank - b.nameRank);
  });
  const available = createMemo(() => {
    const availableCodes = new Set<string>();
    const availableCountries = new Set<string>();
    if (athleteData()) {
      athleteData()!.forEach((d) => {
        availableCodes.add(d.country.toLowerCase());
        availableCountries.add(codeToCountry(d.country));
      });
    }
    return { codes: availableCodes, countries: availableCountries };
  });

  createEffect(() => {
    const cond = debouncedSearchQuery().length < 2 && !countryFilter();
    setIsFilteringByLetter(cond);
  });

  onMount(() => {
    if (!localStorage.getItem("myStore"))
      localStorage.setItem(
        "myStore",
        JSON.stringify({ rated: {}, flagged: [], myRecordings: [] })
      );
    const ls = JSON.parse(localStorage.myStore) as TLocalStorage;
    const recRatings = Object.keys(ls.rated).reduce(
      (obj, key) => ({ ...obj, [key]: ls.rated[key] }),
      {}
    );
    setStore("rating", recRatings);
    setStore("myRecordings", ls.myRecordings);
    setStore("flagged", ls.flagged);
    setStoresLoaded(true);
  });

  createEffect(() => {
    let currentRecs: string[] = [];
    let currentFlags: string[] = [];
    recData()
      ?.recordings.values()
      .forEach((recs) =>
        recs.forEach((r) => {
          currentRecs.push(r.id);
          if (r.flag) currentFlags.push(r.id);
        })
      );
    setStore("myRecordings", (ids) =>
      ids.filter((id) => currentRecs.includes(id))
    );
    setStore("flagged", (ids) => ids.filter((id) => currentFlags.includes(id)));
  });

  createEffect(() => {
    const ls = getLocalStorage();
    ls.flagged = store.flagged;
    localStorage.setItem("myStore", JSON.stringify(ls));
  });

  createEffect(() => {
    const ls = getLocalStorage();
    ls.myRecordings = store.myRecordings;
    localStorage.setItem("myStore", JSON.stringify(ls));
  });
  return (
    <>
      <Show when={isAdmin()}>
        <div class="banner">Admin mode</div>
      </Show>
      <main>
        <h1>The Matt Groomer</h1>
        <Intro />
        <section id="filters">
          <Search searchQuery={searchQuery()} setSearchQuery={setSearchQuery} />
          <DisciplineFilter
            filter={disciplineFilter()}
            setFilterFun={setDisciplineFilter}
          />
          <RecordingFilter
            filter={recordingFilter()}
            setFilterFun={setRecordingFilter}
          />
        </section>

        <section
          id="country-search"
          class={matchingCountries().length ? "padded" : ""}
        >
          <Show when={matchingCountries().length}>
            <h2 class="invisible">Countries</h2>
            <div>
              <For each={matchingCountries()}>
                {(c) => (
                  <CountryButton
                    code={c}
                    setCountryFilter={setCountryFilter}
                    setSearchQuery={setSearchQuery}
                  />
                )}
              </For>
            </div>
          </Show>
        </section>
        <section
          id="athletes"
          onClick={(e) => {
            e.stopPropagation();
            e.target.querySelector(".card[open]")?.removeAttribute("open");
          }}
        >
          <LetterFilter
            isActive={isFilteringByLetter()}
            filter={letterFilter()}
            setFilter={setLetterFilter}
          />
          <h2 class="invisible">Athletes</h2>
          <ErrorBoundary fallback={<div>Something went wrong!</div>}>
            <Suspense fallback={<div>Loading...</div>}>
              <Show when={countryFilter()}>
                <CountryFilter
                  country={codeToCountry(countryFilter()!)}
                  resetFun={() => setCountryFilter()}
                />
              </Show>
              <div class="card-container">
                <For each={filteredData()}>
                  {(d) => (
                    <Card
                      details={d}
                      store={store}
                      setStore={setStore}
                      isAdmin={isAdmin()!}
                      recordings={
                        recData()
                          ?.recordings.get(d.id)
                          ?.map((r, i) => ({ idx: i, ...r }))
                          ?.toSorted(sortByRating) || []
                      }
                      storesLoaded={storesLoaded()}
                    />
                  )}
                </For>
                <Show when={!filteredData().length}>
                  <div>No results to show</div>
                </Show>
              </div>
            </Suspense>
          </ErrorBoundary>
        </section>
        <Footer />
      </main>
      <aside id="popup-container"></aside>
    </>
  );
}
