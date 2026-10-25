import React, { useState, useEffect } from 'react';
import { useRouter } from '../router/RouterContext';
import {
  StudentNode,
  BridgeSkillAnalysis,
  JobMatchCalculation
} from '../types/graph';
import {
  Button,
  Card,
  Badge
} from '../components/design-system/DesignTokens';
import {
  Layers,
  ArrowRight,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Database,
  PlusCircle,
  CheckCircle2,
  Cpu,
  BarChart3
} from 'lucide-react';

interface SkillImprovementPageProps {
  activeStudent: StudentNode;
  bridgeSkills: BridgeSkillAnalysis[];
  matches: JobMatchCalculation[];
  onLearnSkill?: (skillId: string) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const SkillImprovementPage: React.FC<SkillImprovementPageProps> = ({
  activeStudent,
  bridgeSkills,
  matches,
  onLearnSkill,
  isLoading = false,
  error = null,
  onRetry
}) => {
  const { navigate } = useRouter();
  const [animatedIn, setAnimatedIn] = useState<boolean>(false);

  useEffect(() => {
    // Trigger smooth bar and card entrance animation
    const timer = setTimeout(() => {
      setAnimatedIn(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Derive recommendations from missing skills in the live Neo4j job-match response.
  // Do not depend on the legacy in-memory bridgeSkills calculation.
  const recommendedSkills = React.useMemo(() => {
    const ownedSkillIds = new Set(
      matches.flatMap(match => match.matchedSkills.map(item => item.skill.id))
    );
    const bySkill = new Map<string, { id: string; name: string; category: string; jobIds: Set<string>; gains: number[] }>();

    for (const match of matches) {
      for (const missing of match.missingSkills || []) {
        const skill = missing.skill;
        if (!skill?.id || ownedSkillIds.has(skill.id)) continue;
        const existing = bySkill.get(skill.id) || {
          id: skill.id,
          name: skill.name,
          category: skill.category || 'Other',
          jobIds: new Set<string>(),
          gains: [],
        };
        existing.jobIds.add(match.job.id);
        const weight = missing.requiredImportance === 'MANDATORY' ? 2 : 1;
        const estimatedGain = match.totalRequiredCount > 0
          ? (100 * weight) / Math.max(1, match.totalRequiredCount + weight - 1)
          : 0;
        existing.gains.push(estimatedGain);
        bySkill.set(skill.id, existing);
      }
    }

    return Array.from(bySkill.values())
      .map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        jobCount: item.jobIds.size,
        potentialRelevance: item.jobIds.size === 1
          ? `Required by 1 of your current top job matches; learning it may improve compatibility.`
          : `Required by ${item.jobIds.size} of your current top job matches; learning it may improve compatibility.`,
      }))
      .filter(item => item.jobCount > 0)
      .sort((a, b) => b.jobCount - a.jobCount || a.name.localeCompare(b.name))
      .slice(0, 6);
  }, [matches]);

  const maxJobCount = Math.max(1, ...recommendedSkills.map(skill => skill.jobCount));

  // LOADING STATE: Skeleton skill cards
  if (isLoading) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto animate-pulse">
        <div className="space-y-3">
          <div className="h-8 w-60 bg-slate-200 rounded-lg" />
          <div className="h-4 w-96 bg-slate-200 rounded-md" />
        </div>

        <div className="h-16 bg-slate-200 rounded-xl" />

        <div className="space-y-4">
          <div className="h-6 w-52 bg-slate-200 rounded-md" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-slate-200 rounded-2xl" />
            ))}
          </div>
        </div>

        <div className="h-36 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  // ERROR STATE: "Unable to load skill recommendations."
  if (error) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <Card className="p-8 text-center space-y-4 border-rose-200 bg-rose-50/40">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Unable to load skill recommendations.
          </h2>
          <p className="text-xs text-slate-500">
            {error || 'An error occurred while evaluating skill frequency relationships in the graph.'}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                Retry
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={() => navigate('/profile')}>
              Update Profile
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // EMPTY STATE: "No skill recommendations available yet."
  if (recommendedSkills.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <Card className="p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            No skill recommendations available yet.
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            We could not find missing required skills in the job matches currently returned by the database. Try refreshing your recommendations, or check whether published jobs have required skills linked to them.
          </p>
          <div className="pt-2">
            <Button variant="primary" size="md" onClick={() => navigate('/profile')}>
              Add more skills to your profile.
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* PAGE HEADER:
          PAGE TITLE: "Skills to Improve"
          Subtitle: "Discover skills that can improve your compatibility with more jobs."
      */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Skills to Improve
          </h1>
          <p className="text-sm text-slate-600">
            Discover skills that can improve your compatibility with more jobs.
          </p>
        </div>
        <div className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
          <span>GET /api/skills/recommended</span>
        </div>
      </div>

      {/* INTRO:
          Explain briefly:
          "These recommendations are based on the skills required by jobs in the JobGraph database."
      */}
      <div className="p-4 sm:p-5 bg-blue-50/60 border border-blue-200/90 rounded-2xl flex items-start gap-3.5 text-xs text-blue-900 leading-relaxed shadow-xs">
        <Database className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-blue-950 block text-sm mb-0.5">
            Graph-Based Skill Gap Inference
          </span>
          <p className="text-slate-700">
            Recommendations are deterministically computed from your student skills + job required skills + graph traversal relationships. No fake AI-hallucinated recommendations.
          </p>
        </div>
      </div>

      {/* Recommendations below are derived from live Neo4j job-match results. */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-1">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Recommended Skills to Learn
            </h2>
            <p className="text-xs text-slate-500">
              High-frequency graph requirements across active job postings
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            {recommendedSkills.length} skills analyzed
          </span>
        </div>

        {/* CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recommendedSkills.map((item, index) => {
            const barPercentage = Math.round((item.jobCount / maxJobCount) * 100);

            // Compute block characters for demand visual indicator (e.g. ██████████████)
            const blockCount = Math.round((item.jobCount / maxJobCount) * 14);
            const blockIndicator = '█'.repeat(Math.max(blockCount, 2));

            return (
              <div
                key={item.id}
                className={`p-5 sm:p-6 bg-white border border-slate-200/90 rounded-2xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 ${
                  animatedIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
                style={{
                  transitionDelay: `${index * 60}ms`
                }}
              >
                {/* Top: Skill name & Category */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                      {item.category}
                    </span>
                    <span className="text-xs font-bold text-slate-500 tabular-nums">
                      Rank #{index + 1}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    {item.name}
                  </h3>

                  <div className="text-xs font-semibold text-slate-800">
                    Required by <strong className="text-blue-600 font-extrabold text-sm">{item.jobCount} jobs</strong>
                  </div>
                </div>

                {/* Demand Visual Indicator:
                    Example:
                    Docker
                    ██████████████
                    18 jobs
                */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Market Graph Demand</span>
                    <span className="font-bold text-slate-700 tabular-nums">{item.jobCount} jobs</span>
                  </div>

                  {/* Character Block Graphic Representation */}
                  <div className="font-mono text-xs tracking-tight text-blue-600 select-none overflow-hidden h-4 flex items-center">
                    <span
                      className="transition-all duration-700 ease-out inline-block"
                      style={{
                        letterSpacing: '-1px'
                      }}
                    >
                      {blockIndicator}
                    </span>
                  </div>

                  {/* Animated Horizontal Demand Bar */}
                  <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: animatedIn ? `${barPercentage}%` : '0%'
                      }}
                    />
                  </div>
                </div>

                {/* Potential Relevance */}
                <div className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Potential Relevance
                  </span>
                  <p className="line-clamp-2">
                    {item.potentialRelevance}
                  </p>
                </div>

                {/* Optional Simulate / Add to Profile */}
                {onLearnSkill && (
                  <button
                    onClick={() => onLearnSkill(item.id)}
                    className="w-full mt-2 py-2 px-3 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                    Add {item.name} to Learning Plan
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Explain the actual skill-to-job relationships returned by the graph. */}
      <Card className="p-6 sm:p-7 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">
            How These Skills Can Help
          </h2>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          {recommendedSkills.slice(0, 3).map((skill) => (
            <div key={skill.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1.5">
              <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                Learning {skill.name}
              </div>
              <p className="text-xs text-slate-600 pl-4">
                {skill.potentialRelevance} This estimate is based on the job and skill relationships currently available in the graph.
              </p>
            </div>
          ))}
          {recommendedSkills.length === 0 && (
            <p>No missing graph skills currently show additional job matches. Add more jobs or update your profile skills to refresh this analysis.</p>
          )}
        </div>

        {/* Data-oriented Graph Summary */}
        <div className="pt-2 text-xs text-slate-500 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-slate-400" />
            <span>Counts reflect the current graph-based skill-gap analysis</span>
          </div>

          <button
            onClick={() => navigate('/profile')}
            className="text-blue-600 font-semibold hover:underline cursor-pointer flex items-center gap-1"
          >
            Edit Profile Skills <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </Card>

      {/* CTA: "Add more skills to your profile." */}
      <div className="p-6 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-bold text-base text-white">
            Ready to update your career profile?
          </h3>
          <p className="text-xs text-slate-400">
            Keep your skills updated to see live changes across all graph job matches.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/profile')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shrink-0 px-6 py-2.5"
        >
          Add more skills to your profile
        </Button>
      </div>
    </div>
  );
};
