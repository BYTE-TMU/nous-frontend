type Props = {
  rule: string;
};

/**
 * The rule the defender is being tested on, pinned above the first turn.
 * The backend has no separate "rule" field, so this is the defender's prompt, clamped
 * to two lines; the full text is on the Setup tab.
 */
export default function RuleBanner({ rule }: Props) {
  if (!rule) return null;
  return (
    <p
      title={rule}
      className="line-clamp-2 rounded-[13px] border-2 border-dashed border-signal-lime bg-ink px-5 py-[15px] text-xl leading-snug"
    >
      <span className="font-bold">Rule under test:</span> {rule}
    </p>
  );
}
