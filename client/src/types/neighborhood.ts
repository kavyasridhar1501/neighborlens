/** Census demographic data for a neighborhood */
export interface CensusData {
  population: number;
  medianIncome: number;
  medianAge: number;
}

/** Raw data collected from external APIs before ML processing */
export interface RawData {
  census: CensusData;
  amenities: string[];
  redditPosts: string[];
  reviews: string[];
}

/** A fully-enriched neighborhood document returned from the API */
export interface Neighborhood {
  _id: string;
  name: string;
  zip: string;
  cachedAt: string;
  rawData: RawData;
  /** Sentiment score from 0 (negative) to 1 (positive) */
  sentimentScore: number;
  vibeSummary: string;
  lifestyleTags: string[];
  walkScore: number;
  transitScore: number;
  bikeScore: number;
  createdAt: string;
}

/** A saved neighborhood comparison stored in the database */
export interface SavedComparison {
  _id: string;
  neighborhoodIds: string[];
  createdAt: string;
}
