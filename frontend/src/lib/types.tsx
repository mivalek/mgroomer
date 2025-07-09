export type TAthleteData = {
  id: number;
  givenNames: string;
  familyNames: string;
  displayName: string;
  country: string;
  category: number;
  discipline: number;
  hasRecording: boolean;
  hasPic: boolean;
  createdAt: string;
  nameRank: number;
};

export type TRecording = {
  id: string;
  idx?: number;
  size: number;
  createdAt: string;
  author: string;
  athleteId: number;
  flag: boolean;
  rating: number;
  nRatings: number;
};

export interface TLocalStorage {
  rated: { [key: string]: number };
  flagged: string[];
  myRecordings: string[];
}

export interface TStore {
  played: { [key: string]: boolean };
  rating: { [key: string]: number | undefined };
  flagged: string[];
  myRecordings: string[];
}
