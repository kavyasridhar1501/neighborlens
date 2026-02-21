import { clsx } from 'clsx';

interface SentimentBadgeProps {
  score: number;
}

export function SentimentBadge({ score }: SentimentBadgeProps) {
  const label = score >= 0.66 ? 'Positive' : score >= 0.33 ? 'Mixed' : 'Negative';

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        score >= 0.66 && 'bg-emerald-50 text-emerald-700 border-emerald-200',
        score >= 0.33 && score < 0.66 && 'bg-amber-50 text-amber-700 border-amber-200',
        score < 0.33 && 'bg-red-50 text-red-700 border-red-200'
      )}
    >
      {label}
    </span>
  );
}
