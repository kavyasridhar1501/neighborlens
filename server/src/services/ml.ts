const HF_API_BASE = 'https://api-inference.huggingface.co/models';

/** Builds the Authorization header using the HuggingFace API key from env */
function hfHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
    'Content-Type': 'application/json',
  };
}

/** Sentiment label returned by the cardiffnlp model */
interface HFSentimentLabel {
  label: string;
  score: number;
}

/** Response shape from the cardiffnlp sentiment model */
type HFSentimentResponse = HFSentimentLabel[][];

/**
 * Runs sentiment analysis on an array of text strings using
 * cardiffnlp/twitter-roberta-base-sentiment.
 * Maps labels POSITIVE → 1, NEUTRAL → 0.5, NEGATIVE → 0.
 * Returns the average score across all texts.
 * Falls back to 0.5 on any error.
 */
export async function analyzeSentiment(texts: string[]): Promise<number> {
  try {
    const response = await fetch(
      `${HF_API_BASE}/cardiffnlp/twitter-roberta-base-sentiment`,
      {
        method: 'POST',
        headers: hfHeaders(),
        body: JSON.stringify({ inputs: texts }),
      }
    );

    if (!response.ok) return 0.5;

    const data = (await response.json()) as HFSentimentResponse;
    const scores = data.map((labelSet) => {
      const top = labelSet.reduce((a, b) => (a.score > b.score ? a : b));
      const label = top.label.toUpperCase();
      if (label.includes('POS')) return 1;
      if (label.includes('NEG')) return 0;
      return 0.5;
    });

    return scores.reduce((sum, s) => sum + s, 0) / scores.length;
  } catch {
    return 0.5;
  }
}

/** Response shape from the bart-large-cnn summarization model */
interface HFSummaryResponse {
  summary_text: string;
}

/**
 * Generates a plain-language vibe summary from an array of community
 * comments using facebook/bart-large-cnn.
 * Falls back to 'No summary available' on any error.
 */
export async function generateVibeSummary(
  comments: string[]
): Promise<string> {
  try {
    const combined = comments.join('\n').slice(0, 1000);
    const response = await fetch(
      `${HF_API_BASE}/facebook/bart-large-cnn`,
      {
        method: 'POST',
        headers: hfHeaders(),
        body: JSON.stringify({ inputs: combined }),
      }
    );

    if (!response.ok) return 'No summary available';

    const data = (await response.json()) as HFSummaryResponse[];
    return data[0]?.summary_text ?? 'No summary available';
  } catch {
    return 'No summary available';
  }
}

/** Response shape from the bart-large-mnli zero-shot classification model */
interface HFClassificationResponse {
  labels: string[];
  scores: number[];
}

const LIFESTYLE_LABELS = [
  'family-friendly',
  'walkable',
  'nightlife',
  'quiet',
  'up-and-coming',
  'expensive',
  'college town',
  'suburban',
] as const;

/**
 * Classifies a block of text into lifestyle tags using
 * facebook/bart-large-mnli with multi-label zero-shot classification.
 * Returns only labels whose confidence score exceeds 0.65.
 * Falls back to [] on any error.
 */
export async function classifyLifestyleTags(
  text: string
): Promise<string[]> {
  try {
    const response = await fetch(
      `${HF_API_BASE}/facebook/bart-large-mnli`,
      {
        method: 'POST',
        headers: hfHeaders(),
        body: JSON.stringify({
          inputs: text.slice(0, 1000),
          parameters: {
            candidate_labels: LIFESTYLE_LABELS,
            multi_label: true,
          },
        }),
      }
    );

    if (!response.ok) return [];

    const data = (await response.json()) as HFClassificationResponse;
    return data.labels.filter((_, i) => (data.scores[i] ?? 0) > 0.65);
  } catch {
    return [];
  }
}
