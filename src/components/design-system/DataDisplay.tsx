import React from 'react';
import {
  RefreshCw,
  AlertCircle,
  FileX,
  Search,
  Database,
  Briefcase,
  TrendingUp,
  MapPin,
  Clock,
  Building2,
  CheckCircle2,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { Button } from './FormControls';

/* -------------------------------------------------------------------------- */
/* 8. MATCH BADGE & 9. MATCH PROGRESS BAR                                      */
/* -------------------------------------------------------------------------- */

export function getMatchTier(percentage: number) {
  if (percentage >= 90) {
    return {
      tier: 'excellent',
      label: 'Excellent Match',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      progressColor: 'bg-emerald-600',
      strokeColor: '#16A34A'
    };
  }
  if (percentage >= 75) {
    return {
      tier: 'strong',
      label: 'Strong Match',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      progressColor: 'bg-blue-600',
      strokeColor: '#2563EB'
    };
  }
  if (percentage >= 60) {
    return {
      tier: 'moderate',
      label: 'Moderate Match',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      progressColor: 'bg-amber-500',
      strokeColor: '#D97706'
    };
  }
  return {
    tier: 'low',
    label: 'Low Match',
    textColor: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    progressColor: 'bg-rose-500',
    strokeColor: '#DC2626'
  };
}

export interface MatchBadgeProps {
  percentage: number;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const MatchBadge: React.FC<MatchBadgeProps> = ({
  percentage,
  showLabel = true,
  size = 'md',
  className = ''
}) => {
  const info = getMatchTier(percentage);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  const formatted = Number.isInteger(percentage) ? percentage : percentage.toFixed(1);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-semibold border ${info.bgColor} ${info.textColor} ${info.borderColor} ${sizeClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      <span className="tabular-nums font-bold">{formatted}%</span>
      {showLabel && <span>· {info.label}</span>}
    </span>
  );
};

export interface MatchProgressBarProps {
  percentage: number;
  label?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MatchProgressBar: React.FC<MatchProgressBarProps> = ({
  percentage,
  label = 'Skill Match',
  showText = true,
  size = 'md',
  className = ''
}) => {
  const info = getMatchTier(percentage);
  const clamped = Math.max(0, Math.min(100, percentage));
  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';
  const formatted = Number.isInteger(clamped) ? clamped : clamped.toFixed(1);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {showText && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">{label}</span>
          <div className="flex items-center gap-1.5">
            <span className={`font-bold tabular-nums ${info.textColor}`}>
              {formatted}%
            </span>
            <span className={`text-[11px] font-semibold ${info.textColor}`}>
              · {info.label}
            </span>
          </div>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${info.progressColor}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 7. SKILL CHIP                                                              */
/* -------------------------------------------------------------------------- */

export interface SkillChipProps {
  name: string;
  status?: 'matched' | 'missing' | 'recommended' | 'neutral';
  proficiency?: string;
  category?: string;
  onRemove?: () => void;
  size?: 'sm' | 'md';
  className?: string;
}

export const SkillChip: React.FC<SkillChipProps> = ({
  name,
  status = 'neutral',
  proficiency,
  category,
  onRemove,
  size = 'md',
  className = ''
}) => {
  const statusStyles = {
    matched: 'bg-emerald-50 text-emerald-900 border-emerald-200/90 hover:bg-emerald-100/70',
    missing: 'bg-rose-50 text-rose-950 border-rose-200 hover:bg-rose-100/70',
    recommended: 'bg-blue-50 text-blue-950 border-blue-200 hover:bg-blue-100/70',
    neutral: 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
  }[status];

  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border font-medium transition-all animate-chip-entrance duration-200 ${statusStyles} ${sizeStyles} ${className}`}
    >
      {status === 'matched' && <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />}
      {status === 'missing' && <span className="text-rose-500 font-bold shrink-0">✕</span>}
      <span className="font-semibold">{name}</span>
      {proficiency && (
        <span className="text-[10px] opacity-75 font-normal">({proficiency})</span>
      )}
      {category && (
        <span className="text-[10px] opacity-65 font-mono">[{category}]</span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 text-slate-400 hover:text-slate-700 p-0.5 rounded-full"
        >
          ✕
        </button>
      )}
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* 10. KPI CARD                                                               */
/* -------------------------------------------------------------------------- */

export interface KpiCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: string;
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'slate';
  onClick?: () => void;
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  subtext,
  icon,
  trend,
  color = 'blue',
  onClick,
  className = ''
}) => {
  const colorMap = {
    blue: 'bg-blue-50/70 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50/70 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50/70 text-amber-600 border-amber-100',
    purple: 'bg-purple-50/70 text-purple-600 border-purple-100',
    slate: 'bg-slate-100 text-slate-600 border-slate-200'
  }[color];

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs transition-all hover-card-elevation ${
        onClick ? 'hover:border-slate-300 cursor-pointer' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap}`}>
            {icon}
          </div>
        )}
      </div>
      <div className="text-2xl font-black text-slate-900 tracking-tight tabular-nums">
        {value}
      </div>
      {(subtext || trend) && (
        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
          {trend && <span className="font-semibold text-emerald-600">{trend}</span>}
          {subtext && <span>{subtext}</span>}
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 11. JOB CARD (Reusable recommendation / repository card)                  */
/* -------------------------------------------------------------------------- */

export interface JobCardProps {
  title: string;
  company: string;
  location: string;
  jobType?: string;
  salary?: string;
  experience?: string;
  matchScore?: number;
  matchedSkillsCount?: number;
  totalSkillsCount?: number;
  skills?: string[];
  onClick?: () => void;
  className?: string;
}

export const JobCard: React.FC<JobCardProps> = ({
  title,
  company,
  location,
  jobType = 'Full Time',
  salary,
  experience,
  matchScore,
  matchedSkillsCount,
  totalSkillsCount,
  skills = [],
  onClick,
  className = ''
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs transition-all hover-card-elevation hover:border-blue-300 cursor-pointer space-y-4 ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-blue-600">
            {title}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">{company}</span>
            <span>·</span>
            <span className="flex items-center gap-1 text-slate-500">
              <MapPin className="w-3.5 h-3.5" />
              {location}
            </span>
          </div>
        </div>

        {matchScore !== undefined && (
          <div className="shrink-0 text-right">
            <MatchBadge percentage={matchScore} />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1">
        <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-700">
          {jobType}
        </span>
        {salary && (
          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">
            {salary}
          </span>
        )}
        {experience && (
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">
            Exp: {experience}
          </span>
        )}
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {skills.slice(0, 5).map((skill, i) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-700 text-[11px] rounded font-medium"
            >
              {skill}
            </span>
          ))}
          {skills.length > 5 && (
            <span className="px-1.5 py-0.5 text-[10px] text-slate-400">
              +{skills.length - 5} more
            </span>
          )}
        </div>
      )}

      {matchedSkillsCount !== undefined && totalSkillsCount !== undefined && (
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Matches <strong className="text-slate-800">{matchedSkillsCount}</strong> of {totalSkillsCount} required skills
          </span>
          <span className="text-blue-600 font-semibold flex items-center gap-1">
            View Details <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 12. TABLE COMPONENT                                                        */
/* -------------------------------------------------------------------------- */

export interface TableColumn<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No data available',
  onRowClick,
  className = ''
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-xl text-slate-400 text-xs">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-xl border border-slate-200 bg-white ${className}`}>
      <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
        <thead className="bg-slate-50/90 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} scope="col" className={`px-4 py-3 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-800">
          {data.map(item => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick && onRowClick(item)}
              className={`transition-colors ${
                onRowClick ? 'hover:bg-slate-50/80 cursor-pointer' : 'hover:bg-slate-50/40'
              }`}
            >
              {columns.map((col, idx) => (
                <td key={idx} className={`px-4 py-3 align-middle ${col.className || ''}`}>
                  {col.cell ? col.cell(item) : col.accessorKey ? (item[col.accessorKey] as any) : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 16. EMPTY STATE                                                            */
/* -------------------------------------------------------------------------- */

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div
      className={`w-full py-14 px-6 text-center bg-white border border-dashed border-slate-300 rounded-2xl ${className}`}
    >
      <div className="w-12 h-12 mx-auto mb-3.5 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 shadow-2xs">
        {icon || <FileX className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 17. ERROR STATE                                                            */
/* -------------------------------------------------------------------------- */

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Database Operation Failed',
  message,
  onRetry,
  className = ''
}) => {
  return (
    <div
      className={`w-full p-6 bg-rose-50/80 border border-rose-200 rounded-2xl text-rose-900 ${className}`}
    >
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center shrink-0 text-rose-600">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-rose-900">{title}</h4>
          <p className="text-xs text-rose-700 mt-1 font-mono break-all leading-relaxed">
            {message}
          </p>
          {onRetry && (
            <div className="mt-4">
              <Button
                variant="destructive"
                size="sm"
                onClick={onRetry}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Retry Query
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 18. SKELETON LOADER                                                        */
/* -------------------------------------------------------------------------- */

export interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = 'h-4 w-full' }) => {
  return <div className={`skeleton-shimmer rounded-md ${className}`} />;
};

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 bg-white border border-slate-200 rounded-xl space-y-3.5 shadow-xs"
        >
          <div className="h-5 skeleton-shimmer rounded w-2/3" />
          <div className="h-3.5 skeleton-shimmer rounded w-1/3" />
          <div className="h-10 skeleton-shimmer rounded-lg" />
          <div className="flex gap-2">
            <div className="h-6 w-16 skeleton-shimmer rounded-md" />
            <div className="h-6 w-16 skeleton-shimmer rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 19. LOADING SPINNER                                                        */
/* -------------------------------------------------------------------------- */

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label,
  className = ''
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }[size];

  return (
    <div className={`inline-flex items-center gap-2 text-slate-600 ${className}`}>
      <RefreshCw className={`${sizeMap} animate-spin text-blue-600`} />
      {label && <span className="text-xs font-medium text-slate-500">{label}</span>}
    </div>
  );
};
