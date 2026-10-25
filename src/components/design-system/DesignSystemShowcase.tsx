import React, { useState } from 'react';
import {
  MatchIndicator,
  SkillChip,
  Badge,
  Button,
  Card,
  getMatchTier
} from './DesignTokens';
import {
  Palette,
  Type,
  Component,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  MapPin,
  Clock,
  Layers,
  Search,
  Zap,
  Sliders,
  Send,
  Trash2
} from 'lucide-react';

export const DesignSystemShowcase: React.FC = () => {
  const [testPercentage, setTestPercentage] = useState<number>(84);
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const [sampleInputVal, setSampleInputVal] = useState<string>('');
  const [sampleInputError, setSampleInputError] = useState<boolean>(false);

  const simulateLoading = () => {
    setBtnLoading(true);
    setTimeout(() => setBtnLoading(false), 2000);
  };

  return (
    <div className="space-y-10">
      {/* Design System Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">
            <Palette className="w-4 h-4" />
            JOBGRAPH Visual Design System Specification
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
            Career Analytics & Graph Visualization Design System
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            A cohesive, accessible design language engineered for technology and academic career intelligence. Employs strong typographic hierarchy, high-contrast numeric data visualization, calibrated skill chips, and unambiguous match indicators.
          </p>
        </div>
      </div>

      {/* 1. COLOR SYSTEM */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <Palette className="w-3.5 h-3.5" />
            Tokens · 01
          </div>
          <h2 className="text-xl font-bold text-slate-900">Color System & Semantic Roles</h2>
          <p className="text-xs text-slate-500 mt-1">
            Technology-oriented palette with disciplined contrast rations (WCAG AA compliant).
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Primary */}
          <div className="p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="h-14 rounded-lg bg-blue-600 flex items-end p-2 text-white font-mono text-[10px]">
              #2563EB
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Primary Blue</span>
              <span className="text-[11px] text-slate-500">Brand, CTAs, Graph Nodes</span>
            </div>
          </div>

          {/* Secondary */}
          <div className="p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="h-14 rounded-lg bg-sky-500 flex items-end p-2 text-white font-mono text-[10px]">
              #0EA5E9
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Cool Cyan</span>
              <span className="text-[11px] text-slate-500">Secondary actions, links</span>
            </div>
          </div>

          {/* Success */}
          <div className="p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="h-14 rounded-lg bg-emerald-600 flex items-end p-2 text-white font-mono text-[10px]">
              #16A34A
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Success Green</span>
              <span className="text-[11px] text-slate-500">Acquired skills, 90%+ match</span>
            </div>
          </div>

          {/* Warning */}
          <div className="p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="h-14 rounded-lg bg-amber-500 flex items-end p-2 text-white font-mono text-[10px]">
              #F59E0B
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Warning Amber</span>
              <span className="text-[11px] text-slate-500">Moderate match, bridge tips</span>
            </div>
          </div>

          {/* Danger */}
          <div className="p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="h-14 rounded-lg bg-rose-600 flex items-end p-2 text-white font-mono text-[10px]">
              #DC2626
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Danger Red</span>
              <span className="text-[11px] text-slate-500">Missing gaps, destructive</span>
            </div>
          </div>

          {/* Neutral */}
          <div className="p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="h-14 rounded-lg bg-slate-900 flex items-end p-2 text-white font-mono text-[10px]">
              #0F172A
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Neutral Slate</span>
              <span className="text-[11px] text-slate-500">Body text, dark surfaces</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. TYPOGRAPHIC HIERARCHY */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <Type className="w-3.5 h-3.5" />
            Tokens · 02
          </div>
          <h2 className="text-xl font-bold text-slate-900">Typographic Scale & Hierarchy</h2>
          <p className="text-xs text-slate-500 mt-1">
            Plus Jakarta Sans paired with JetBrains Mono tabular figures for metrics.
          </p>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-slate-800">
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <span className="text-[11px] font-mono text-slate-400 block mb-1">Display · 28px/32px Bold</span>
              <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                JobGraph Career Skill Intelligence
              </div>
            </div>
            <span className="text-xs text-slate-400 font-mono shrink-0">text-2xl sm:text-3xl font-bold</span>
          </div>

          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <span className="text-[11px] font-mono text-slate-400 block mb-1">H1 · 22px Bold Page Title</span>
              <div className="text-xl font-bold text-slate-900">
                Junior Full Stack Developer Requirements
              </div>
            </div>
            <span className="text-xs text-slate-400 font-mono shrink-0">text-xl font-bold</span>
          </div>

          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <span className="text-[11px] font-mono text-slate-400 block mb-1">H2 · 18px Bold Section Heading</span>
              <div className="text-base font-bold text-slate-900">
                Skill Gap Set & Bridge Recommendations
              </div>
            </div>
            <span className="text-xs text-slate-400 font-mono shrink-0">text-base font-bold</span>
          </div>

          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <span className="text-[11px] font-mono text-slate-400 block mb-1">H3 · 14px SemiBold Card Heading</span>
              <div className="text-sm font-semibold text-slate-900">
                Node Property Matrix: [:REQUIRES_SKILL]
              </div>
            </div>
            <span className="text-xs text-slate-400 font-mono shrink-0">text-sm font-semibold</span>
          </div>

          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <span className="text-[11px] font-mono text-slate-400 block mb-1">Body · 13px Regular Text</span>
              <div className="text-xs text-slate-600 max-w-xl leading-relaxed">
                Evaluates graph traversal paths between students and job nodes using index-free adjacency.
              </div>
            </div>
            <span className="text-xs text-slate-400 font-mono shrink-0">text-xs text-slate-600</span>
          </div>

          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <span className="text-[11px] font-mono text-slate-400 block mb-1">Small · 11px Metadata & Labels</span>
              <div className="text-[11px] text-slate-400">
                Roll No: BCA-2024-042 · CGPA: 8.4 · 9 Connected Edges
              </div>
            </div>
            <span className="text-xs text-slate-400 font-mono shrink-0">text-[11px] text-slate-400</span>
          </div>

          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 bg-slate-50/50">
            <div>
              <span className="text-[11px] font-mono text-slate-400 block mb-1">Numeric Typography · Tabular Figures</span>
              <div className="flex items-center gap-6 font-bold text-slate-900 tabular-nums">
                <span className="text-emerald-600 text-xl">88.5% Match</span>
                <span className="text-blue-600 text-xl">14 Skills</span>
                <span className="text-slate-700 text-xl">6 Vacancies</span>
                <span className="text-amber-600 text-xl">2 Gaps</span>
              </div>
            </div>
            <span className="text-xs text-slate-400 font-mono shrink-0">font-bold tabular-nums</span>
          </div>
        </div>
      </Card>

      {/* 3. MATCH INDICATOR TIERS & LIVE TESTING */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <Zap className="w-3.5 h-3.5" />
            Tokens · 03
          </div>
          <h2 className="text-xl font-bold text-slate-900">Match Indicators & 4-Tier Scoring</h2>
          <p className="text-xs text-slate-500 mt-1">
            Never relies on color alone — every indicator combines color token, semantic label, and tabular numeric value.
          </p>
        </div>

        {/* Live Interactive Slider */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              Live Interactive Score Simulator:
            </span>
            <span className="text-sm font-bold text-blue-600 font-mono tabular-nums">
              {testPercentage}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={testPercentage}
            onChange={e => setTestPercentage(parseInt(e.target.value) || 0)}
            className="w-full accent-blue-600 cursor-pointer"
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-3 border-t border-slate-200">
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Circular Meter:</span>
              <MatchIndicator percentage={testPercentage} variant="circle" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Linear Progress Meter:</span>
              <MatchIndicator percentage={testPercentage} variant="meter" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Compact Meter:</span>
              <div className="pt-2">
                <MatchIndicator percentage={testPercentage} variant="compact" />
              </div>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block mb-1">Badge Token:</span>
              <div className="pt-2">
                <MatchIndicator percentage={testPercentage} variant="badge" />
              </div>
            </div>
          </div>
        </div>

        {/* The 4 Formal Tiers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tier 1: 90-100% */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800">90% – 100%</span>
              <span className="text-[10px] font-mono text-emerald-600 font-semibold">Tier 1</span>
            </div>
            <h3 className="text-sm font-bold text-emerald-950">Excellent Match</h3>
            <p className="text-[11px] text-emerald-800">
              Complete or near-complete skill graph overlap. Ideal candidate qualification.
            </p>
            <div className="pt-2">
              <MatchIndicator percentage={95} variant="meter" />
            </div>
          </div>

          {/* Tier 2: 75-89% */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-800">75% – 89%</span>
              <span className="text-[10px] font-mono text-blue-600 font-semibold">Tier 2</span>
            </div>
            <h3 className="text-sm font-bold text-blue-950">Strong Match</h3>
            <p className="text-[11px] text-blue-800">
              Meets all mandatory competencies with minor optional preferred skill gaps.
            </p>
            <div className="pt-2">
              <MatchIndicator percentage={82} variant="meter" />
            </div>
          </div>

          {/* Tier 3: 60-74% */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800">60% – 74%</span>
              <span className="text-[10px] font-mono text-amber-600 font-semibold">Tier 3</span>
            </div>
            <h3 className="text-sm font-bold text-amber-950">Moderate Match</h3>
            <p className="text-[11px] text-amber-800">
              Possesses baseline stack but requires targeted bridge skill acquisition.
            </p>
            <div className="pt-2">
              <MatchIndicator percentage={68} variant="meter" />
            </div>
          </div>

          {/* Tier 4: <60% */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-800">Below 60%</span>
              <span className="text-[10px] font-mono text-rose-600 font-semibold">Tier 4</span>
            </div>
            <h3 className="text-sm font-bold text-rose-950">Low Match</h3>
            <p className="text-[11px] text-rose-800">
              Substantial skill gap. Extensive roadmap learning required before application.
            </p>
            <div className="pt-2">
              <MatchIndicator percentage={45} variant="meter" />
            </div>
          </div>
        </div>
      </Card>

      {/* 4. SKILL CHIPS SYSTEM */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Tokens · 04
          </div>
          <h2 className="text-xl font-bold text-slate-900">Skill Chips Classification</h2>
          <p className="text-xs text-slate-500 mt-1">
            Triple-state taxonomy: Acquired competencies, Gap deficiencies, and High-ROI Bridge skills.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Acquired Skills */}
          <div className="p-4 border border-emerald-200 bg-emerald-50/20 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Existing Skills (Positive/Neutral)
            </div>
            <p className="text-[11px] text-slate-500">
              Student has active <code className="font-mono text-slate-700">[:HAS_SKILL]</code> edge.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <SkillChip name="JavaScript (ES6+)" variant="existing" proficiency="Advanced" />
              <SkillChip name="React.js" variant="existing" proficiency="Intermediate" />
              <SkillChip name="Node.js" variant="existing" proficiency="Intermediate" />
              <SkillChip name="Git & GitHub" variant="existing" proficiency="Advanced" />
            </div>
          </div>

          {/* Missing Skills */}
          <div className="p-4 border border-rose-200 bg-rose-50/20 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              Missing Skills (Warning/Danger)
            </div>
            <p className="text-[11px] text-slate-500">
              Skill gap set difference: <code className="font-mono text-slate-700">JobSkills \ StudentSkills</code>.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <SkillChip name="Docker Containers" variant="missing" importance="MANDATORY" />
              <SkillChip name="TypeScript" variant="missing" importance="MANDATORY" />
              <SkillChip name="Redis Caching" variant="missing" importance="PREFERRED" />
            </div>
          </div>

          {/* Recommended Skills */}
          <div className="p-4 border border-blue-200 bg-blue-50/20 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-800">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Recommended Bridge Skills (Accent)
            </div>
            <p className="text-[11px] text-slate-500">
              Centrality-driven candidate unlocking multiple disconnected job nodes.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <SkillChip name="Docker (+24% Boost)" variant="recommended" />
              <SkillChip name="Neo4j & Cypher" variant="recommended" />
              <SkillChip name="PostgreSQL" variant="recommended" />
            </div>
          </div>
        </div>
      </Card>

      {/* 5. BUTTONS, INPUTS & BADGES */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <Component className="w-3.5 h-3.5" />
            Tokens · 05
          </div>
          <h2 className="text-xl font-bold text-slate-900">Form Controls & Interactive Primitives</h2>
          <p className="text-xs text-slate-500 mt-1">
            Clear visual affordances, active hover/focus rings, and resilient feedback states.
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Button Hierarchy & States
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" icon={<Send className="w-3.5 h-3.5" />}>
              Primary Action
            </Button>
            <Button variant="secondary" icon={<Sparkles className="w-3.5 h-3.5" />}>
              Secondary Accent
            </Button>
            <Button variant="outline">
              Secondary Outline
            </Button>
            <Button variant="ghost">
              Ghost Button
            </Button>
            <Button variant="destructive" icon={<Trash2 className="w-3.5 h-3.5" />}>
              Destructive
            </Button>
            <Button
              variant="primary"
              isLoading={btnLoading}
              onClick={simulateLoading}
            >
              {btnLoading ? 'Traversing Graph...' : 'Test Loading State'}
            </Button>
            <Button variant="primary" disabled>
              Disabled State
            </Button>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Input Controls & Validation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            {/* Standard Input */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Search Job Title or Skill
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Backend API Engineer..."
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Filters graph nodes in real time
              </span>
            </div>

            {/* Error State Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-700">
                  Minimum Academic CGPA
                </label>
                <button
                  onClick={() => setSampleInputError(!sampleInputError)}
                  className="text-[10px] text-blue-600 hover:underline"
                >
                  Toggle Error
                </button>
              </div>
              <input
                type="text"
                value={sampleInputVal}
                onChange={e => setSampleInputVal(e.target.value)}
                placeholder="Enter CGPA (0.0 - 10.0)"
                className={`w-full px-3 py-2 rounded-lg text-xs transition-all ${
                  sampleInputError
                    ? 'bg-rose-50/50 border border-rose-300 text-rose-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600'
                    : 'bg-slate-50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600'
                }`}
              />
              {sampleInputError ? (
                <span className="text-[11px] text-rose-600 mt-1 block font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Value must be between 5.0 and 10.0
                </span>
              ) : (
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Eligible threshold for campus placement
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Metadata Badges System
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary" icon={<Briefcase className="w-3 h-3" />}>
              Full-Time
            </Badge>
            <Badge variant="default" icon={<Clock className="w-3 h-3" />}>
              Entry Level
            </Badge>
            <Badge variant="outline" icon={<MapPin className="w-3 h-3" />}>
              Bangalore / Hybrid
            </Badge>
            <Badge variant="success">
              CGPA ≥ 7.5
            </Badge>
            <Badge variant="warning">
              Preferred: Redis
            </Badge>
            <Badge variant="danger">
              Mandatory: Node.js
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};
