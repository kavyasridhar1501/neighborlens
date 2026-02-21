import { clsx } from 'clsx';

interface SentimentBadgeProps {
  score: number;
}

/**
 * Displays a color-coded sentiment badge based on a 0–1 score.
 * >= 0.66 → green "Positive"
 * >= 0.33 → yellow "Mixed"
 * <  0.33 → red "Negative"
 */
export function SentimentBadge({ score }: SentimentBadgeProps) {
  const label = score >= 0.66 ? 'Positive' : score >= 0.33 ? 'Mixed' : 'Negative';

  return (
    <span
      className={clsx(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold',
        score >= 0.66 && 'bg-green-100 text-green-800',
        score >= 0.33 && score < 0.66 && 'bg-yellow-100 text-yellow-800',
        score < 0.33 && 'bg-red-100 text-red-800'
      )}
    >
      {label}
    </span>
  );
}
