import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  MapPin,
  Briefcase,
  Clock,
  ChevronRight,
  Loader2
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* MATCH INDICATOR SYSTEM                                                     */
/* -------------------------------------------------------------------------- */

export type MatchTier = 'excellent' | 'strong' | 'moderate' | 'low';

export interface MatchTierInfo {
  tier: MatchTier;
  label: string;
  min: number;
  max: number;
  textColor: string;
  bgColor: string;
  borderColor: string;
  progressColor: string;
  strokeColor: string;
}

export function getMatchTier(percentage: number): MatchTierInfo {
  if (percentage >= 90) {
    return {
      tier: 'excellent',
      label: 'Excellent Match',
      min: 90,
      max: 100,
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
      min: 75,
      max: 89,
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
      min: 60,
      max: 74,
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
    min: 0,
    max: 59,
    textColor: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    progressColor: 'bg-rose-500',
    strokeColor: '#DC2626'
  };
}

interface MatchIndicatorProps {
  percentage: number;
  variant?: 'meter' | 'circle' | 'badge' | 'compact';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MatchIndicator: React.FC<MatchIndicatorProps> = ({
  percentage,
  variant = 'meter',
  showLabel = true,
  size = 'md',
  className = ''
}) => {
  const info = getMatchTier(percentage);
  const clamped = Math.max(0, Math.min(100, percentage));
  const formatted = Number.isInteger(clamped) ? clamped : clamped.toFixed(1);

  if (variant === 'circle') {
    const dim = size === 'sm' ? 44 : size === 'lg' ? 68 : 54;
    const strokeWidth = size === 'sm' ? 3.5 : size === 'lg' ? 5 : 4;
    const radius = (dim - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (clamped / 100) * circumference;

    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="relative inline-flex items-center justify-center shrink-0">
          <svg width={dim} height={dim} className="rotate-[-90deg]">
            <circle
              cx={dim / 2}
              cy={dim / 2}
              r={radius}
              stroke="#E2E8F0"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <circle
              cx={dim / 2}
              cy={dim / 2}
              r={radius}
              stroke={info.strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <div className="absolute text-center">
            <span
              className={`font-bold tabular-nums text-slate-900 ${
                size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
              }`}
            >
              {formatted}%
            </span>
          </div>
        </div>

        {showLabel && (
          <div>
            <div className={`font-semibold ${info.textColor} text-xs`}>
              {info.label}
            </div>
            <div className="text-[11px] text-slate-500">
              Graph Compatibility
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${info.bgColor} ${info.textColor} ${info.borderColor} ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
        <span className="tabular-nums font-bold">{formatted}%</span>
        {showLabel && <span>· {info.label}</span>}
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <div className="w-14 bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full ${info.progressColor}`}
            style={{ width: `${clamped}%` }}
          />
        </div>
        <span className={`text-xs font-bold tabular-nums ${info.textColor}`}>
          {formatted}%
        </span>
        {showLabel && (
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            ({info.label})
          </span>
        )}
      </div>
    );
  }

  // Default: meter with linear progress bar and explicit values
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600 font-medium">Graph Match Overlap</span>
        <div className="flex items-center gap-1.5">
          <span className={`font-bold tabular-nums ${info.textColor}`}>
            {formatted}%
          </span>
          {showLabel && (
            <span className={`text-[11px] font-semibold ${info.textColor}`}>
              · {info.label}
            </span>
          )}
        </div>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${info.progressColor}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* SKILL CHIP SYSTEM                                                          */
/* -------------------------------------------------------------------------- */

export type SkillChipVariant = 'existing' | 'missing' | 'recommended' | 'neutral';

interface SkillChipProps {
  name: string;
  variant?: SkillChipVariant;
  proficiency?: string;
  importance?: 'MANDATORY' | 'PREFERRED';
  onAction?: () => void;
  actionLabel?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const SkillChip: React.FC<SkillChipProps> = ({
  name,
  variant = 'neutral',
  proficiency,
  importance,
  onAction,
  actionLabel,
  size = 'md',
  className = ''
}) => {
  const styles = {
    existing: {
      container: 'bg-emerald-50 text-emerald-900 border-emerald-200/90 hover:bg-emerald-100/70',
      icon: <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />,
      subtext: 'text-emerald-700',
      badge: 'Acquired'
    },
    missing: {
      container: importance === 'MANDATORY'
        ? 'bg-rose-50 text-rose-950 border-rose-300 hover:bg-rose-100/70'
        : 'bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100/70',
      icon: <AlertCircle className={`w-3 h-3 shrink-0 ${importance === 'MANDATORY' ? 'text-rose-600' : 'text-amber-600'}`} />,
      subtext: importance === 'MANDATORY' ? 'text-rose-700' : 'text-amber-700',
      badge: importance === 'MANDATORY' ? 'Missing (Mandatory)' : 'Missing (Preferred)'
    },
    recommended: {
      container: 'bg-blue-50 text-blue-950 border-blue-200 hover:bg-blue-100/70',
      icon: <Sparkles className="w-3 h-3 text-blue-600 shrink-0" />,
      subtext: 'text-blue-700',
      badge: 'Bridge Skill'
    },
    neutral: {
      container: 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100',
      icon: null,
      subtext: 'text-slate-500',
      badge: null
    }
  };

  const current = styles[variant];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-lg border font-medium transition-all ${current.container} ${sizeClasses} ${className}`}
    >
      {current.icon}
      <span className="font-semibold">{name}</span>

      {proficiency && (
        <span className={`text-[10px] opacity-80 font-normal ${current.subtext}`}>
          ({proficiency})
        </span>
      )}

      {importance && variant !== 'missing' && (
        <span className="text-[10px] font-mono opacity-70">
          [{importance[0]}]
        </span>
      )}

      {onAction && actionLabel && (
        <button
          onClick={e => {
            e.stopPropagation();
            onAction();
          }}
          className="ml-1 text-[10px] font-semibold underline text-blue-600 hover:text-blue-800 focus:outline-none"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* BADGE SYSTEM                                                               */
/* -------------------------------------------------------------------------- */

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className = ''
}) => {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    outline: 'bg-transparent text-slate-600 border-slate-300'
  };

  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border font-medium ${variantStyles[variant]} ${sizeStyles} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

/* -------------------------------------------------------------------------- */
/* BUTTON SYSTEM                                                              */
/* -------------------------------------------------------------------------- */

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon,
  children,
  className = '',
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center gap-1.5 font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer';

  const variantStyles = {
    primary:
      'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs focus:ring-blue-500',
    secondary:
      'bg-sky-50 hover:bg-sky-100 active:bg-sky-200 text-sky-800 border border-sky-200 focus:ring-sky-400',
    outline:
      'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-300 focus:ring-slate-400 shadow-2xs',
    ghost:
      'bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-600 hover:text-slate-900 focus:ring-slate-300',
    destructive:
      'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xs focus:ring-rose-500'
  };

  const sizeStyles = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3.5 py-2 text-xs',
    lg: 'px-4.5 py-2.5 text-sm'
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${base} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};

/* -------------------------------------------------------------------------- */
/* CARD CONTAINER                                                             */
/* -------------------------------------------------------------------------- */

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  style
}) => {
  return (
    <div
      onClick={onClick}
      style={style}
      className={`bg-white border border-slate-200/90 rounded-xl shadow-xs transition-all ${
        hoverable ? 'hover:border-slate-300 hover:shadow-sm cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
