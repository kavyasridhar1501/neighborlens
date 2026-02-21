interface VibeTagProps {
  tag: string;
}

/** Minimal neutral tag palette — no loud colors */
const TAG_COLORS = [
  'bg-zinc-100 text-zinc-700',
  'bg-stone-200 text-stone-700',
  'bg-slate-100 text-slate-700',
  'bg-neutral-200 text-neutral-700',
  'bg-zinc-200 text-zinc-800',
  'bg-stone-100 text-stone-600',
  'bg-slate-200 text-slate-700',
  'bg-neutral-100 text-neutral-600',
] as const;

function colorForTag(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = (hash * 31 + tag.charCodeAt(i)) >>> 0;
  }
  return TAG_COLORS[hash % TAG_COLORS.length] ?? TAG_COLORS[0];
}

export function VibeTag({ tag }: VibeTagProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorForTag(tag)}`}
    >
      {tag}
    </span>
  );
}
