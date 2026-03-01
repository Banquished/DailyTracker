type MissedBadgeProps = {
  count: number;
};

export function MissedBadge({ count }: MissedBadgeProps): React.ReactElement | null {
  if (count === 0) return null;

  return (
    <span className="badge badge-danger">
      {count} missed
    </span>
  );
}
