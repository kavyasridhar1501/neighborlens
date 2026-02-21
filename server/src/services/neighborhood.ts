import { INeighborhood } from '../models/Neighborhood';
import { checkCache, saveToCache } from './cache';
import { analyzeSentiment } from './ml';

/** Census ACS5 row: [NAME, population, medianIncome, medianAge, geoId] */
type CensusRow = [string, string, string, string, string];

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
    const censusUrl =
      `https://api.census.gov/data/2021/acs/acs5` +
      `?get=NAME,B01003_001E,B19013_001E,B01002_001E` +
      `&for=zip+code+tabulation+area:${zip}`;

    const res = await fetch(censusUrl);
    if (!res.ok) {
      console.error(`[Census] HTTP ${res.status} for ZIP ${zip}`);
      return { name: `ZIP ${zip}`, population: 0, medianIncome: 0, medianAge: 0 };
    }

    const rows = (await res.json()) as CensusRow[];
    const [, row] = rows; // row 0 is headers
    if (!row)
      return { name: `ZIP ${zip}`, population: 0, medianIncome: 0, medianAge: 0 };

    const CENSUS_NULL = -666666666;
    const rawName = row[0] ?? `ZIP ${zip}`;
    const population = parseInt(row[1] ?? '0', 10);
    const medianIncome = parseInt(row[2] ?? '0', 10);
    const medianAge = parseFloat(row[3] ?? '0');

    return {
      name: rawName.replace(/^ZCTA5\s+/, ''),
      population: population === CENSUS_NULL ? 0 : population,
      medianIncome: medianIncome === CENSUS_NULL ? 0 : medianIncome,
      medianAge: medianAge === CENSUS_NULL ? 0 : medianAge,
    };
  } catch (err) {
    console.error(`[Census] Error for ZIP ${zip}:`, err);
    return { name: `ZIP ${zip}`, population: 0, medianIncome: 0, medianAge: 0 };
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
    if (!res.ok) {
      console.error(`[Reddit] HTTP ${res.status} for query "${query}"`);
      return [];
    }

    const data = (await res.json()) as RedditResponse;
    const posts = data.data.children
      .map((c) => `${c.data.title} ${c.data.selftext}`.trim())
      .filter(Boolean)
      .slice(0, 10);
    console.log(`[Reddit] Fetched ${posts.length} posts for "${query}"`);
    return posts;
  } catch (err) {
    console.error(`[Reddit] Error for query "${query}":`, err);
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

    const geoUrl = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    geoUrl.searchParams.set('address', query);
    geoUrl.searchParams.set('key', apiKey);

    const geoRes = await fetch(geoUrl.toString());
    if (!geoRes.ok) {
      console.error(`[Google] Geocode HTTP ${geoRes.status} for "${query}"`);
      return { amenities: [], reviews: [] };
    }

    const geoData = (await geoRes.json()) as GoogleGeocodeResult;
    if ((geoData as any).error_message) {
      console.error(`[Google] Geocode error: ${(geoData as any).error_message}`);
      return { amenities: [], reviews: [] };
    }
    const loc = geoData.results[0]?.geometry.location;
    if (!loc) {
      console.error(`[Google] No geocode results for "${query}"`);
      return { amenities: [], reviews: [] };
    }

    const nearbyUrl = new URL(
      'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
    );
    nearbyUrl.searchParams.set('location', `${loc.lat},${loc.lng}`);
    nearbyUrl.searchParams.set('radius', '1500');
    nearbyUrl.searchParams.set('key', apiKey);

    const nearbyRes = await fetch(nearbyUrl.toString());
    if (!nearbyRes.ok) {
      console.error(`[Google] Places HTTP ${nearbyRes.status} for "${query}"`);
      return { amenities: [], reviews: [] };
    }

    const nearbyData = (await nearbyRes.json()) as GooglePlacesResult;
    console.log(`[Google] Found ${nearbyData.results.length} places for "${query}"`);
    const places = nearbyData.results.slice(0, 10);
    const amenities = places.map((p) => p.name);

    const reviews: string[] = [];
    await Promise.all(
      places.slice(0, 3).map(async (place) => {
        try {
          const detailsUrl = new URL(
            'https://maps.googleapis.com/maps/api/place/details/json'
          );
          detailsUrl.searchParams.set('place_id', place.place_id);
          detailsUrl.searchParams.set('fields', 'reviews');
          detailsUrl.searchParams.set('key', apiKey);

          const detailsRes = await fetch(detailsUrl.toString());
          if (!detailsRes.ok) return;

          const detailsData = (await detailsRes.json()) as GooglePlaceDetailsResult;
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
 * Builds a structured neighborhood insight summary and lifestyle tags
 * from census demographics, amenities, and community sentiment.
 * Works for every US ZIP — no external ML API required.
 */
function buildInsightSummary(params: {
  name: string;
  zip: string;
  population: number;
  medianIncome: number;
  medianAge: number;
  amenities: string[];
  sentimentScore: number;
  communityTextCount: number;
}): { vibeSummary: string; lifestyleTags: string[] } {
  const {
    name,
    zip,
    population,
    medianIncome,
    medianAge,
    amenities,
    sentimentScore,
    communityTextCount,
  } = params;

  const sentences: string[] = [];
  const tags = new Set<string>();

  // --- Demographics ---
  const demoParts: string[] = [];
  if (population > 0) demoParts.push(`population of ${population.toLocaleString()}`);
  if (medianIncome > 0)
    demoParts.push(`median household income of $${medianIncome.toLocaleString()}`);
  if (medianAge > 0) demoParts.push(`median age of ${medianAge}`);

  if (demoParts.length > 0) {
    sentences.push(`${name || zip} has a ${demoParts.join(', ')}.`);
  } else {
    sentences.push(`${name || zip} is a US ZIP code area.`);
  }

  // Income-based tags
  if (medianIncome >= 120_000) tags.add('expensive');
  else if (medianIncome > 0 && medianIncome < 45_000) tags.add('up-and-coming');

  // Age-based tags
  if (medianAge > 0 && medianAge < 24) tags.add('college town');
  else if (medianAge > 0 && medianAge < 33) tags.add('young professionals');
  else if (medianAge > 45) tags.add('quiet');

  // --- Walkability ---
  const amenityText = amenities.map((a) => a.toLowerCase()).join(' ');
  if (amenities.length >= 8) {
    sentences.push(
      `It is highly walkable with ${amenities.length} nearby places including ${amenities.slice(0, 3).join(', ')}.`
    );
    tags.add('walkable');
  } else if (amenities.length >= 3) {
    sentences.push(
      `The area has ${amenities.length} nearby amenities such as ${amenities.slice(0, 2).join(', ')}.`
    );
  } else {
    sentences.push('This area has limited walkable amenities and is primarily car-dependent.');
    tags.add('suburban');
  }

  // Amenity-based lifestyle tags
  if (/bar|club|lounge|brewery|pub|cocktail/.test(amenityText)) tags.add('nightlife');
  if (/park|school|playground|library|recreation|daycare/.test(amenityText))
    tags.add('family-friendly');

  // --- Community sentiment ---
  if (communityTextCount > 0) {
    const label =
      sentimentScore >= 0.66 ? 'positive' : sentimentScore >= 0.33 ? 'mixed' : 'negative';
    sentences.push(
      `Community sentiment is ${label} based on ${communityTextCount} local posts and reviews.`
    );
  } else {
    sentences.push(
      'No recent community posts were found — demographic and amenity data sourced from US Census and Google Places.'
    );
  }

  return {
    vibeSummary: sentences.join(' '),
    lifestyleTags: [...tags],
  };
}

/**
 * Orchestrates all external API calls and insight generation for a given
 * neighborhood query string (city name or ZIP code).
 * Checks the 24-hour MongoDB cache first before making external requests.
 */
export async function getNeighborhoodData(
  query: string
): Promise<INeighborhood> {
  const normalizedQuery = query.trim();

  // 1. Check cache
  const cached = await checkCache(normalizedQuery);
  if (cached) return cached;

  // 2. Fetch external data in parallel
  const [censusData, redditPosts, placesData] = await Promise.all([
    fetchCensusData(isZip(normalizedQuery) ? normalizedQuery : normalizedQuery),
    fetchRedditPosts(normalizedQuery),
    fetchGooglePlacesData(normalizedQuery),
  ]);

  // 3. Combine community texts for sentiment analysis
  const communityTexts = [...redditPosts, ...placesData.reviews].filter(Boolean);

  // 4. Sentiment score from HuggingFace (falls back to 0.5 on failure)
  const sentimentScore =
    communityTexts.length > 0 ? await analyzeSentiment(communityTexts) : 0.5;

  // 5. Build deterministic insight summary and lifestyle tags
  const { vibeSummary, lifestyleTags } = buildInsightSummary({
    name: censusData.name,
    zip: normalizedQuery,
    population: censusData.population,
    medianIncome: censusData.medianIncome,
    medianAge: censusData.medianAge,
    amenities: placesData.amenities,
    sentimentScore,
    communityTextCount: communityTexts.length,
  });

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
  } as Parameters<typeof saveToCache>[0]);
}
