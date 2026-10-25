import React from 'react';
import { Share2, Layers, Briefcase, User, Building2, MapPin, Sparkles } from 'lucide-react';

export interface GraphMotifProps {
  topLabel?: string;
  topType?: 'Skill' | 'Company' | 'Location';
  bottomLabel?: string;
  bottomType?: 'Skill' | 'Company' | 'Location';
  leftLabel?: string;
  leftType?: 'Student' | 'Skill';
  rightLabel?: string;
  rightType?: 'Job' | 'Company';
  variant?: 'compact' | 'card' | 'mini' | 'hero';
  caption?: string;
  badgeLabel?: 'Graph-Based Matching' | 'Skill Relationships' | 'Connected Job Data' | string;
  className?: string;
}

/**
 * GraphMotif:
 * Subtly reinforces graph concepts (Node, Connection, Relationship, Skill, Job, Company, Location)
 * based on the orthogonal visual motif:
 * 
 *         Java (Skill)
 *           ●
 *           │
 *           │
 * Student ●─┼──● Backend Developer (Job)
 *           │
 *        Python (Skill)
 *           ●
 * 
 * Used sparingly for:
 * - Landing page hero
 * - Dashboard mini visualization
 * - Admin graph overview
 * - Small decorative elements
 */
export const GraphMotif: React.FC<GraphMotifProps> = ({
  topLabel = 'Java',
  topType = 'Skill',
  bottomLabel = 'Python',
  bottomType = 'Skill',
  leftLabel = 'Student',
  leftType = 'Student',
  rightLabel = 'Backend Developer',
  rightType = 'Job',
  variant = 'card',
  caption,
  badgeLabel = 'Graph-Based Matching',
  className = ''
}) => {
  if (variant === 'mini') {
    return (
      <div
        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700 text-xs font-mono select-none ${className}`}
        role="img"
        aria-label={`Graph relationship: ${leftLabel} connected to ${rightLabel} through ${topLabel} and ${bottomLabel}`}
      >
        <span className="inline-flex items-center gap-1 font-semibold text-blue-700">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
          {leftLabel}
        </span>
        <span className="text-slate-400 font-sans">●─┼──●</span>
        <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
          {rightLabel}
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={`p-3.5 bg-slate-50/90 border border-slate-200/90 rounded-xl relative select-none ${className}`}
        role="img"
        aria-label={`Graph relationship: ${leftLabel} connects to ${rightLabel} via ${topLabel} and ${bottomLabel}`}
      >
        {badgeLabel && (
          <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
              <Share2 className="w-3 h-3 text-blue-600" />
              {badgeLabel}
            </span>
            <span className="text-[9px] font-mono text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              Neo4j Edge Schema
            </span>
          </div>
        )}

        {/* SVG Orthogonal Diagram */}
        <div className="flex items-center justify-center py-1">
          <svg
            viewBox="0 0 280 140"
            className="w-full max-w-[280px] h-auto overflow-visible"
            aria-hidden="true"
          >
            {/* Orthogonal connector lines */}
            {/* Horizontal line */}
            <line x1="60" y1="70" x2="220" y2="70" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="75" y1="70" x2="205" y2="70" stroke="#3B82F6" strokeWidth="2" />

            {/* Vertical line */}
            <line x1="140" y1="28" x2="140" y2="112" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="140" y1="36" x2="140" y2="104" stroke="#10B981" strokeWidth="2" />

            {/* Intersection point (┼) */}
            <circle cx="140" cy="70" r="4" fill="#1E293B" stroke="#FFFFFF" strokeWidth="1.5" />

            {/* Top Node: e.g. Java */}
            <g transform="translate(140, 24)">
              <circle cx="0" cy="0" r="6" fill="#F43F5E" />
              <text x="0" y="-10" textAnchor="middle" className="text-[10px] font-bold fill-slate-800" style={{ fontSize: '10px' }}>
                {topLabel}
              </text>
              <text x="0" y="-21" textAnchor="middle" className="text-[8px] font-semibold fill-slate-600 uppercase" style={{ fontSize: '8px' }}>
                {topType}
              </text>
            </g>

            {/* Bottom Node: e.g. Python */}
            <g transform="translate(140, 116)">
              <circle cx="0" cy="0" r="6" fill="#10B981" />
              <text x="0" y="16" textAnchor="middle" className="text-[10px] font-bold fill-slate-800" style={{ fontSize: '10px' }}>
                {bottomLabel}
              </text>
              <text x="0" y="26" textAnchor="middle" className="text-[8px] font-semibold fill-slate-600 uppercase" style={{ fontSize: '8px' }}>
                {bottomType}
              </text>
            </g>

            {/* Left Node: e.g. Student */}
            <g transform="translate(68, 70)">
              <circle cx="0" cy="0" r="6" fill="#2563EB" />
              <text x="-10" y="4" textAnchor="end" className="text-[10px] font-bold fill-blue-700" style={{ fontSize: '10px' }}>
                {leftLabel}
              </text>
            </g>

            {/* Right Node: e.g. Backend Developer */}
            <g transform="translate(212, 70)">
              <circle cx="0" cy="0" r="6" fill="#0D9488" />
              <text x="10" y="4" textAnchor="start" className="text-[10px] font-bold fill-slate-900" style={{ fontSize: '10px' }}>
                {rightLabel}
              </text>
            </g>
          </svg>
        </div>

        {caption && (
          <p className="text-[11px] text-slate-500 text-center mt-1 border-t border-slate-200/50 pt-1.5 font-mono">
            {caption}
          </p>
        )}
      </div>
    );
  }

  // Card Variant (default)
  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs relative select-none ${className}`}
      role="img"
      aria-label={`Graph visualization: ${leftLabel} matching to ${rightLabel} through skills ${topLabel} and ${bottomLabel}`}
    >
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
            <Share2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 leading-none">
              {badgeLabel}
            </h4>
            <span className="text-[10px] text-slate-600 font-mono">
              Relationships: HAS_SKILL · REQUIRES_SKILL
            </span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
          Connected Graph
        </span>
      </div>

      {/* ASCII-inspired clean SVG rendition */}
      <div className="relative py-2 px-2 flex items-center justify-center">
        <svg
          viewBox="0 0 340 180"
          className="w-full max-w-[340px] h-auto overflow-visible"
          aria-hidden="true"
        >
          {/* Subtle grid pattern background */}
          <line x1="80" y1="90" x2="260" y2="90" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" />
          <line x1="170" y1="35" x2="170" y2="145" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="4 4" />

          {/* Active relationship links */}
          <line x1="100" y1="90" x2="240" y2="90" stroke="#3B82F6" strokeWidth="2.5" />
          <line x1="170" y1="45" x2="170" y2="135" stroke="#10B981" strokeWidth="2.5" />

          {/* Central Intersection (┼) */}
          <circle cx="170" cy="90" r="5" fill="#1E293B" stroke="#FFFFFF" strokeWidth="2" />

          {/* Top Node: Java */}
          <g transform="translate(170, 35)">
            <circle cx="0" cy="0" r="7" fill="#E11D48" stroke="#FFFFFF" strokeWidth="2" />
            <text x="0" y="-12" textAnchor="middle" className="text-[11px] font-bold fill-slate-900" style={{ fontSize: '11px' }}>
              {topLabel}
            </text>
            <rect x="-24" y="-32" width="48" height="15" rx="3" fill="#FFE4E6" />
            <text x="0" y="-22" textAnchor="middle" className="text-[9px] font-bold fill-rose-700" style={{ fontSize: '9px' }}>
              {topType}
            </text>
          </g>

          {/* Bottom Node: Python */}
          <g transform="translate(170, 145)">
            <circle cx="0" cy="0" r="7" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
            <text x="0" y="20" textAnchor="middle" className="text-[11px] font-bold fill-slate-900" style={{ fontSize: '11px' }}>
              {bottomLabel}
            </text>
            <rect x="-24" y="27" width="48" height="15" rx="3" fill="#D1FAE5" />
            <text x="0" y="37" textAnchor="middle" className="text-[9px] font-bold fill-emerald-800" style={{ fontSize: '9px' }}>
              {bottomType}
            </text>
          </g>

          {/* Left Node: Student */}
          <g transform="translate(90, 90)">
            <circle cx="0" cy="0" r="7" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
            <text x="-12" y="4" textAnchor="end" className="text-[11px] font-bold fill-blue-700" style={{ fontSize: '11px' }}>
              {leftLabel}
            </text>
            <rect x="-85" y="-18" width="70" height="14" rx="3" fill="#EFF6FF" />
            <text x="-50" y="-8" textAnchor="middle" className="text-[9px] font-semibold fill-blue-700" style={{ fontSize: '9px' }}>
              Student Node
            </text>
          </g>

          {/* Right Node: Backend Developer */}
          <g transform="translate(250, 90)">
            <circle cx="0" cy="0" r="7" fill="#0F766E" stroke="#FFFFFF" strokeWidth="2" />
            <text x="14" y="4" textAnchor="start" className="text-[11px] font-bold fill-slate-900" style={{ fontSize: '11px' }}>
              {rightLabel}
            </text>
            <rect x="14" y="-18" width="58" height="14" rx="3" fill="#CCFBF1" />
            <text x="43" y="-8" textAnchor="middle" className="text-[9px] font-semibold fill-teal-800" style={{ fontSize: '9px' }}>
              Job Node
            </text>
          </g>
        </svg>
      </div>

      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="font-mono text-slate-600">
          (Student)-[:HAS_SKILL]-&gt;(Skill)&lt;-[:REQUIRES_SKILL]-(Job)
        </span>
        <span className="text-emerald-700 font-semibold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Graph Match Verified
        </span>
      </div>
    </div>
  );
};
