interface EmptyStateProps {
  message: string;
  submessage?: string;
  icon?: string;
}

export default function EmptyState({ message, submessage, icon = '📭' }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">{icon}</div>
      <p className="text-dark/60 text-lg mb-2">{message}</p>
      {submessage && <p className="text-dark/40">{submessage}</p>}
    </div>
  );
}
