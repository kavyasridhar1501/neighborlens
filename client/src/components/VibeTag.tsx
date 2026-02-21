interface VibeTagProps {
  tag: string;
}

/** Pastel color palette for lifestyle tags */
const TAG_COLORS = [
  'bg-purple-100 text-purple-800',
  'bg-blue-100 text-blue-800',
  'bg-teal-100 text-teal-800',
  'bg-emerald-100 text-emerald-800',
  'bg-amber-100 text-amber-800',
  'bg-rose-100 text-rose-800',
  'bg-sky-100 text-sky-800',
  'bg-fuchsia-100 text-fuchsia-800',
] as const;

/**
 * Computes a deterministic color index for a given tag string
 * so the same tag always renders with the same pastel color.
 */
function colorForTag(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = (hash * 31 + tag.charCodeAt(i)) >>> 0;
  }
  return TAG_COLORS[hash % TAG_COLORS.length] ?? TAG_COLORS[0];
}

/**
 * Renders a single lifestyle tag as a colored pill badge.
 */
export function VibeTag({ tag }: VibeTagProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorForTag(tag)}`}
    >
      {tag}
    </span>
  );
}
