import { countryList } from "./constants";
import { TAthleteData, TLocalStorage, TRecording } from "./types";

export function getInitials(data: TAthleteData): string {
  //   return data.givenNames.split(" ")[0][0];
  return data.givenNames.split(" ")[0][0] + data.familyNames.split(" ")[0][0];
}

export function codeToCountry(code: string): string {
  return countryList[code.toUpperCase()] || code.toUpperCase();
}

export function countryToCode(country: string): string {
  return (
    Object.keys(countryList).at(Object.values(countryList).indexOf(country)) ||
    ""
  );
}

export function matchCountries(x: string, countries: string[]): string[] {
  return countries
    .filter((c) =>
      c
        .toLowerCase()
        .split(" ")
        .some((cc) => cc.startsWith(x.toLowerCase()))
    )
    .map((c) => countryToCode(c));
}

export function getLocalStorage() {
  return JSON.parse(localStorage.myStore) as TLocalStorage;
}
export function getAllRatingsFromLocalStorage() {
  return getLocalStorage().rated;
}

export function getRatingFromLocalStorage(id: string): number | undefined {
  return getAllRatingsFromLocalStorage()[id];
}

export function setRatingInLocalStorage(
  id: string,
  rating: number,
  remove: boolean
) {
  const ls = getLocalStorage();
  if (remove) {
    delete ls.rated[id];
  } else {
    ls.rated[id] = rating;
  }
  localStorage.setItem("myStore", JSON.stringify(ls));
}

export function addRecordingToLocalStorage(id: string) {
  const ls = getLocalStorage();
  ls.myRecordings.push(id);
  localStorage.setItem("myStore", JSON.stringify(ls));
}

export function addFlagToLocalStorage(id: string) {
  const ls = getLocalStorage();
  ls.flagged.push(id);
  localStorage.setItem("myStore", JSON.stringify(ls));
}
function applyShrinkage(rec: TRecording, n = 3) {
  return (rec.rating * rec.nRatings + n * 0.5) / (rec.nRatings + n);
}
export function sortByRating(a: TRecording, b: TRecording, shrinkage = 3) {
  return applyShrinkage(b, shrinkage) - applyShrinkage(a, shrinkage);
}
