import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  X,
  ChevronDown,
  Check,
  AlertCircle,
  HelpCircle,
  Loader2
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* 3. BUTTON COMPONENT (Enhanced with Loading text & Spinners)                */
/* -------------------------------------------------------------------------- */

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  disabled = false,
  icon,
  children,
  className = '',
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center gap-1.5 font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer';

  const variantStyles: Record<ButtonVariant, string> = {
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

  const sizeStyles: Record<ButtonSize, string> = {
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
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};

/* -------------------------------------------------------------------------- */
/* 4. INPUT COMPONENT                                                         */
/* -------------------------------------------------------------------------- */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, rightElement, className = '', id, ...props }, ref) => {
    const generatedId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={generatedId}
            className="block text-xs font-semibold text-slate-700"
          >
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative rounded-lg shadow-2xs">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={generatedId}
            className={`w-full text-xs rounded-lg border bg-white py-2 transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-slate-50 disabled:text-slate-400 ${
              icon ? 'pl-9' : 'pl-3'
            } ${rightElement ? 'pr-9' : 'pr-3'} ${
              error
                ? 'border-rose-400 text-rose-900 focus:border-rose-500 focus:ring-rose-400'
                : 'border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-blue-500'
            } ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center">
              {rightElement}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-[11px] font-medium text-rose-600 flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            {error}
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-slate-500 mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';

/* -------------------------------------------------------------------------- */
/* 5. SELECT COMPONENT                                                        */
/* -------------------------------------------------------------------------- */

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, helperText, options = [], placeholder, className = '', id, children, ...props },
    ref
  ) => {
    const generatedId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={generatedId}
            className="block text-xs font-semibold text-slate-700"
          >
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative rounded-lg shadow-2xs">
          <select
            ref={ref}
            id={generatedId}
            className={`w-full text-xs rounded-lg border bg-white py-2 pl-3 pr-8 appearance-none transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer ${
              error
                ? 'border-rose-400 text-rose-900 focus:border-rose-500 focus:ring-rose-400'
                : 'border-slate-300 text-slate-900 focus:border-blue-500 focus:ring-blue-500'
            } ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.length > 0
              ? options.map(opt => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error ? (
          <p className="text-[11px] font-medium text-rose-600 flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            {error}
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-slate-500 mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Select.displayName = 'Select';

/* -------------------------------------------------------------------------- */
/* 6. MULTI-SELECT SKILL INPUT                                                */
/* -------------------------------------------------------------------------- */

export interface SkillOptionItem {
  id: string;
  name: string;
  category?: string;
}

export interface MultiSelectSkillInputProps {
  label?: string;
  availableSkills: SkillOptionItem[];
  selectedSkillIds: string[];
  onChange: (selectedIds: string[]) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
}

export const MultiSelectSkillInput: React.FC<MultiSelectSkillInputProps> = ({
  label = 'Required Skills',
  availableSkills,
  selectedSkillIds,
  onChange,
  placeholder = 'Search skills to attach...',
  error,
  helperText
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSkills = availableSkills.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  const toggleSkill = (id: string) => {
    if (selectedSkillIds.includes(id)) {
      onChange(selectedSkillIds.filter(item => item !== id));
    } else {
      onChange([...selectedSkillIds, id]);
    }
  };

  const removeSkill = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedSkillIds.filter(item => item !== id));
  };

  const selectedSkillObjects = availableSkills.filter(s => selectedSkillIds.includes(s.id));

  return (
    <div className="w-full space-y-1.5" ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700">
          {label}
        </label>
      )}

      {/* Selected tags chip box */}
      <div
        onClick={() => setIsOpen(true)}
        className={`min-h-[42px] p-1.5 bg-white border rounded-lg flex flex-wrap items-center gap-1.5 cursor-text transition-colors shadow-2xs ${
          isOpen ? 'ring-2 ring-blue-500 border-blue-500' : error ? 'border-rose-400' : 'border-slate-300'
        }`}
      >
        {selectedSkillObjects.map(skill => (
          <span
            key={skill.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium"
          >
            <span>{skill.name}</span>
            <button
              type="button"
              onClick={e => removeSkill(skill.id, e)}
              className="text-blue-500 hover:text-blue-800 p-0.5 rounded-full hover:bg-blue-100 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        <div className="flex-1 min-w-[120px] flex items-center">
          <input
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={selectedSkillIds.length === 0 ? placeholder : 'Add more...'}
            className="w-full text-xs text-slate-800 bg-transparent border-0 focus:outline-none p-1 placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Dropdown suggestions */}
      {isOpen && (
        <div className="relative">
          <div className="absolute z-30 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg py-1 text-xs">
            {filteredSkills.length === 0 ? (
              <div className="px-3 py-2 text-slate-400 text-center">
                No matching skills found
              </div>
            ) : (
              filteredSkills.map(skill => {
                const isSelected = selectedSkillIds.includes(skill.id);
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => toggleSkill(skill.id)}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                      isSelected ? 'bg-blue-50/70 text-blue-800 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                      <span>{skill.name}</span>
                    </div>
                    {skill.category && (
                      <span className="text-[10px] text-slate-400 px-1.5 py-0.5 bg-slate-100 rounded">
                        {skill.category}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {error ? (
        <p className="text-[11px] font-medium text-rose-600 flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
};
