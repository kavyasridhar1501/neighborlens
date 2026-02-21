import { INeighborhood } from '../models/Neighborhood';
import { checkCache, saveToCache } from './cache';
import {
  analyzeSentiment,
  generateVibeSummary,
  classifyLifestyleTags,
} from './ml';

/** Census geocoder address result */
interface GeocoderResult {
  result: {
    addressMatches: Array<{
      coordinates: { x: number; y: number };
    }>;
  };
}

/** Census ACS5 row: [NAME, population, medianIncome, medianAge, geoId] */
type CensusRow = [string, string, string, string, string];

/** Walk Score API response */
interface WalkScoreResponse {
  walkscore?: number;
  transit?: { score?: number };
  bike?: { score?: number };
}

/** Reddit search API response */
interface RedditResponse {
  data: {
    children: Array<{
      data: { title: string; selftext: string };
    }>;
  };
}

/** Google Geocoding API result */
interface GoogleGeocodeResult {
  results: Array<{
    geometry: { location: { lat: number; lng: number } };
  }>;
}

/** Google Places Nearby Search result */
interface GooglePlacesResult {
  results: Array<{ place_id: string; name: string }>;
}

/** Google Place Details result */
interface GooglePlaceDetailsResult {
  result: {
    reviews?: Array<{ text: string }>;
  };
}

/**
 * Returns true if the query looks like a 5-digit US ZIP code.
 */
function isZip(query: string): boolean {
  return /^\d{5}$/.test(query.trim());
}

/**
 * Geocodes an address to lat/lon using the Census Bureau geocoder.
 * Returns null if no match is found.
 */
async function geocodeAddress(
  address: string
): Promise<{ lat: number; lon: number } | null> {
  try {
    const url = new URL(
      'https://geocoding.geo.census.gov/geocoder/locations/onelineaddress'
    );
    url.searchParams.set('address', address);
    url.searchParams.set('benchmark', '2020');
    url.searchParams.set('format', 'json');

    const res = await fetch(url.toString());
    if (!res.ok) return null;

    const data = (await res.json()) as GeocoderResult;
    const match = data.result.addressMatches[0];
    if (!match) return null;

    return { lat: match.coordinates.y, lon: match.coordinates.x };
  } catch {
    return null;
  }
}

/**
 * Fetches population, median income, and median age from the
 * Census Bureau ACS5 API for the given ZIP code.
 */
async function fetchCensusData(zip: string): Promise<{
  name: string;
  population: number;
  medianIncome: number;
  medianAge: number;
}> {
  try {
    const url = new URL('https://api.census.gov/data/2021/acs/acs5');
    url.searchParams.set(
      'get',
      'NAME,B01003_001E,B19013_001E,B01002_001E'
    );
    url.searchParams.set('for', `zip+code+tabulation+area:${zip}`);

    const res = await fetch(url.toString());
    if (!res.ok)
      return { name: `ZIP ${zip}`, population: 0, medianIncome: 0, medianAge: 0 };

    const rows = (await res.json()) as CensusRow[];
    const [, row] = rows; // row 0 is headers
    if (!row)
      return { name: `ZIP ${zip}`, population: 0, medianIncome: 0, medianAge: 0 };

    return {
      name: row[0] ?? `ZIP ${zip}`,
      population: parseInt(row[1] ?? '0', 10),
      medianIncome: parseInt(row[2] ?? '0', 10),
      medianAge: parseFloat(row[3] ?? '0'),
    };
  } catch {
    return { name: `ZIP ${zip}`, population: 0, medianIncome: 0, medianAge: 0 };
  }
}

/**
 * Fetches Walk, Transit, and Bike scores from the Walk Score API.
 * Requires a lat/lon for accurate results.
 */
async function fetchWalkScore(
  address: string,
  lat: number,
  lon: number
): Promise<{ walkScore: number; transitScore: number; bikeScore: number }> {
  try {
    const url = new URL('https://api.walkscore.com/score');
    url.searchParams.set('format', 'json');
    url.searchParams.set('address', address);
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lon));
    url.searchParams.set('transit', '1');
    url.searchParams.set('bike', '1');
    url.searchParams.set('wsapikey', process.env.WALKSCORE_API_KEY ?? '');

    const res = await fetch(url.toString());
    if (!res.ok) return { walkScore: 0, transitScore: 0, bikeScore: 0 };

    const data = (await res.json()) as WalkScoreResponse;
    return {
      walkScore: data.walkscore ?? 0,
      transitScore: data.transit?.score ?? 0,
      bikeScore: data.bike?.score ?? 0,
    };
  } catch {
    return { walkScore: 0, transitScore: 0, bikeScore: 0 };
  }
}

/**
 * Fetches the top 10 recent Reddit posts mentioning the neighborhood.
 * Uses the public JSON API — no auth required.
 */
async function fetchRedditPosts(query: string): Promise<string[]> {
  try {
    const url = new URL('https://www.reddit.com/search.json');
    url.searchParams.set('q', `${query} neighborhood`);
    url.searchParams.set('sort', 'relevance');
    url.searchParams.set('limit', '10');
    url.searchParams.set('t', 'year');

    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': process.env.REDDIT_USER_AGENT ?? 'NeighborLens/1.0',
      },
    });
    if (!res.ok) return [];

    const data = (await res.json()) as RedditResponse;
    return data.data.children
      .map((c) => `${c.data.title} ${c.data.selftext}`.trim())
      .filter(Boolean)
      .slice(0, 10);
  } catch {
    return [];
  }
}

/**
 * Fetches nearby amenity names and review snippets from Google Places API.
 */
async function fetchGooglePlacesData(query: string): Promise<{
  amenities: string[];
  reviews: string[];
}> {
  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY ?? '';

    // Step 1: Geocode the query
    const geoUrl = new URL(
      'https://maps.googleapis.com/maps/api/geocode/json'
    );
    geoUrl.searchParams.set('address', query);
    geoUrl.searchParams.set('key', apiKey);

    const geoRes = await fetch(geoUrl.toString());
    if (!geoRes.ok) return { amenities: [], reviews: [] };

    const geoData = (await geoRes.json()) as GoogleGeocodeResult;
    const loc = geoData.results[0]?.geometry.location;
    if (!loc) return { amenities: [], reviews: [] };

    // Step 2: Nearby search
    const nearbyUrl = new URL(
      'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
    );
    nearbyUrl.searchParams.set('location', `${loc.lat},${loc.lng}`);
    nearbyUrl.searchParams.set('radius', '1500');
    nearbyUrl.searchParams.set('key', apiKey);

    const nearbyRes = await fetch(nearbyUrl.toString());
    if (!nearbyRes.ok) return { amenities: [], reviews: [] };

    const nearbyData = (await nearbyRes.json()) as GooglePlacesResult;
    const places = nearbyData.results.slice(0, 10);
    const amenities = places.map((p) => p.name);

    // Step 3: Fetch reviews for top 3 places
    const reviews: string[] = [];
    const topPlaces = places.slice(0, 3);

    await Promise.all(
      topPlaces.map(async (place) => {
        try {
          const detailsUrl = new URL(
            'https://maps.googleapis.com/maps/api/place/details/json'
          );
          detailsUrl.searchParams.set('place_id', place.place_id);
          detailsUrl.searchParams.set('fields', 'reviews');
          detailsUrl.searchParams.set('key', apiKey);

          const detailsRes = await fetch(detailsUrl.toString());
          if (!detailsRes.ok) return;

          const detailsData =
            (await detailsRes.json()) as GooglePlaceDetailsResult;
          const placeReviews = (detailsData.result.reviews ?? [])
            .slice(0, 3)
            .map((r) => r.text);
          reviews.push(...placeReviews);
        } catch {
          // skip individual place errors
        }
      })
    );

    return { amenities, reviews };
  } catch {
    return { amenities: [], reviews: [] };
  }
}

/**
 * Orchestrates all external API calls and ML inference for a given
 * neighborhood query string (city name or ZIP code).
 * Checks the 24-hour MongoDB cache first before making external requests.
 */
export async function getNeighborhoodData(
  query: string
): Promise<INeighborhood> {
  const normalizedQuery = query.trim();
  const zip = isZip(normalizedQuery) ? normalizedQuery : normalizedQuery;

  // 1. Check cache
  const cached = await checkCache(zip);
  if (cached) return cached;

  // 2. Geocode so we have lat/lon for Walk Score
  const coords = await geocodeAddress(normalizedQuery);
  const lat = coords?.lat ?? 0;
  const lon = coords?.lon ?? 0;

  // 3. Fetch external data in parallel
  const [censusData, walkData, redditPosts, placesData] = await Promise.all([
    fetchCensusData(zip),
    fetchWalkScore(normalizedQuery, lat, lon),
    fetchRedditPosts(normalizedQuery),
    fetchGooglePlacesData(normalizedQuery),
  ]);

  // 4. Combine review texts for ML
  const allTexts = [
    ...redditPosts,
    ...placesData.reviews,
  ].filter(Boolean);

  const mlInput = allTexts.length > 0 ? allTexts : [`neighborhood: ${normalizedQuery}`];

  // 5. Run ML services in parallel
  const [sentimentScore, vibeSummary, lifestyleTags] = await Promise.all([
    analyzeSentiment(mlInput),
    generateVibeSummary(mlInput),
    classifyLifestyleTags(mlInput.join(' ')),
  ]);

  // 6. Save to cache and return
  return saveToCache({
    name: censusData.name,
    zip: normalizedQuery,
    cachedAt: new Date(),
    rawData: {
      census: {
        population: censusData.population,
        medianIncome: censusData.medianIncome,
        medianAge: censusData.medianAge,
      },
      amenities: placesData.amenities,
      redditPosts,
      reviews: placesData.reviews,
    },
    sentimentScore,
    vibeSummary,
    lifestyleTags,
    walkScore: walkData.walkScore,
    transitScore: walkData.transitScore,
    bikeScore: walkData.bikeScore,
  } as Parameters<typeof saveToCache>[0]);
}
