import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-ink-500" />
      </div>
      <h3 className="font-display text-lg font-semibold text-ink-900">
        {title}
      </h3>
      <p className="text-sm text-ink-500 mt-1 max-w-sm">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;
