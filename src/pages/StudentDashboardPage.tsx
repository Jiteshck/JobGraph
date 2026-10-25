import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from '../router/RouterContext';
import {
  StudentNode,
  JobMatchCalculation,
  BridgeSkillAnalysis,
  SkillNode
} from '../types/graph';
import {
  MatchIndicator,
  SkillChip,
  Button,
  Card,
  Badge,
  GraphMotif
} from '../components/design-system';
import {
  Sparkles,
  Briefcase,
  Percent,
  AlertTriangle,
  ArrowRight,
  MapPin,
  GraduationCap,
  Clock,
  Share2,
  RefreshCw,
  Building,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

interface StudentDashboardPageProps {
  activeStudent: StudentNode;
  studentSkills: Array<{ skill: SkillNode; proficiency: string }>;
  matches: JobMatchCalculation[];
  bridgeSkills: BridgeSkillAnalysis[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const StudentDashboardPage: React.FC<StudentDashboardPageProps> = ({
  activeStudent,
  studentSkills,
  matches,
  bridgeSkills,
  isLoading = false,
  error = null,
  onRetry
}) => {
  const { navigate } = useRouter();
  const [hasMounted, setHasMounted] = useState<boolean>(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Compute KPI Statistics
  const totalSkillsCount = studentSkills.length;
  
  // Count only jobs with a positive calculated match. Do not report every job as
  // a match when all calculated percentages are zero.
  const matchingJobsCount = useMemo(() => {
    return matches.filter(m => Number.isFinite(m.matchPercentage) && m.matchPercentage > 0).length;
  }, [matches]);

  const averageMatchPercentage = useMemo(() => {
    if (matches.length === 0) return 0;
    const sum = matches.reduce((acc, m) => acc + m.matchPercentage, 0);
    return Math.round(sum / matches.length);
  }, [matches]);

  // Aggregate missing skills across target jobs
  const missingSkillFrequency = useMemo(() => {
    const freqMap = new Map<string, { skill: SkillNode; count: number }>();
    matches.forEach(m => {
      m.missingSkills.forEach(ms => {
        const existing = freqMap.get(ms.skill.id);
        if (existing) {
          existing.count += 1;
        } else {
          freqMap.set(ms.skill.id, { skill: ms.skill, count: 1 });
        }
      });
    });
    return Array.from(freqMap.values()).sort((a, b) => b.count - a.count);
  }, [matches]);

  const skillsToLearnCount = missingSkillFrequency.length;

  // Top 4 Job Matches for the main section
  const topJobMatches = useMemo(() => {
    return [...matches]
      .filter(m => Number.isFinite(m.matchPercentage))
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 4);
  }, [matches]);

  // Top 3-4 Missing Skills for the gap summary
  const topSkillGaps = useMemo(() => {
    return missingSkillFrequency.slice(0, 4);
  }, [missingSkillFrequency]);

  // Handle First Name for personalized greeting (e.g., "Welcome, Jitesh")
  const displayName = useMemo(() => {
    if (!activeStudent?.name) return 'Student';
    return activeStudent.name.split(' ')[0];
  }, [activeStudent]);

  // 1. LOADING STATE
  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse max-w-6xl mx-auto">
        <div className="space-y-2">
          <div className="h-8 bg-slate-200 rounded-lg w-1/4" />
          <div className="h-4 bg-slate-100 rounded-lg w-1/3" />
        </div>

        {/* Skeleton KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-5 bg-white border border-slate-200 rounded-xl space-y-3">
              <div className="flex justify-between">
                <div className="h-4 bg-slate-100 rounded w-1/2" />
                <div className="w-5 h-5 bg-slate-200 rounded-full" />
              </div>
              <div className="h-8 bg-slate-200 rounded w-1/3" />
              <div className="h-3 bg-slate-100 rounded w-2/3" />
            </div>
          ))}
        </div>

        {/* Skeleton Job Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            <div className="h-5 bg-slate-200 rounded w-1/4" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-6 bg-white border border-slate-200 rounded-xl space-y-3">
                <div className="h-5 bg-slate-200 rounded w-1/3" />
                <div className="h-4 bg-slate-100 rounded w-1/2" />
                <div className="h-2 bg-slate-100 rounded w-full" />
              </div>
            ))}
          </div>
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 bg-white border border-slate-200 rounded-xl h-64" />
          </div>
        </div>
      </div>
    );
  }

  // 2. ERROR STATE
  if (error) {
    return (
      <Card className="p-10 max-w-xl mx-auto text-center space-y-4 my-12">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Unable to load your dashboard.</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {error || 'There was an issue connecting to the graph database session.'}
        </p>
        <div className="pt-2">
          <Button
            variant="primary"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={onRetry || (() => window.location.reload())}
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  // 3. EMPTY STATE: If no skills exist
  if (totalSkillsCount === 0) {
    return (
      <Card className="p-12 max-w-xl mx-auto text-center space-y-5 my-12 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">
            Welcome, {displayName}
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Add your skills to start discovering matching jobs.
          </p>
        </div>
        <div className="pt-2">
          <Button
            variant="primary"
            size="md"
            icon={<ArrowRight className="w-4 h-4" />}
            onClick={() => navigate('/profile')}
          >
            Add Skills
          </Button>
        </div>
      </Card>
    );
  }

  // 4. NORMAL POPULATED DASHBOARD
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Welcome, {displayName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Here is your current job matching overview.
          </p>
        </div>
        <div className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
          <span>GET /api/students/{activeStudent.id}/matches</span>
          <span className="text-slate-300">&bull;</span>
          <span>GET /api/students/{activeStudent.id}/skill-gaps</span>
        </div>
      </div>

      {/* TOP STATISTICS: 4 KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Skills */}
        <Card className="p-5 space-y-2 hover:border-slate-300 transition-all shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 font-semibold text-xs">
            <span>Total Skills</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
            {totalSkillsCount}
          </div>
          <span className="text-[11px] text-slate-400 block truncate">
            Connected profile skills
          </span>
        </Card>

        {/* KPI 2: Matching Jobs */}
        <Card className="p-5 space-y-2 hover:border-slate-300 transition-all shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 font-semibold text-xs">
            <span>Matching Jobs</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
            {matchingJobsCount}
          </div>
          <span className="text-[11px] text-slate-400 block truncate">
            Roles with skill overlap
          </span>
        </Card>

        {/* KPI 3: Average Match */}
        <Card className="p-5 space-y-2 hover:border-slate-300 transition-all shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 font-semibold text-xs">
            <span>Average Match</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Percent className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-blue-600 tabular-nums">
            {averageMatchPercentage}%
          </div>
          <span className="text-[11px] text-slate-400 block truncate">
            Across active postings
          </span>
        </Card>

        {/* KPI 4: Skills to Learn */}
        <Card className="p-5 space-y-2 hover:border-slate-300 transition-all shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 font-semibold text-xs">
            <span>Skills to Learn</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-600 tabular-nums">
            {skillsToLearnCount}
          </div>
          <span className="text-[11px] text-slate-400 block truncate">
            Identified gap competencies
          </span>
        </Card>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Top Job Matches */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold text-slate-900">
              Top Job Matches
            </h2>
            <button
              onClick={() => navigate('/jobs')}
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all jobs ({matches.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {topJobMatches.map((m, idx) => (
              <Card
                key={m.job.id}
                className="p-5 hover:border-slate-300 transition-all shadow-2xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="font-mono font-bold text-blue-600">#{idx + 1}</span>
                      <span>·</span>
                      <span className="font-semibold text-slate-800">{m.job.company}</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5 text-slate-500">
                        <MapPin className="w-3 h-3 text-slate-400 inline" />
                        {m.job.location}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      {m.job.title}
                    </h3>
                  </div>

                  {/* Compact Match Indicator */}
                  <div className="flex items-center gap-3">
                    <MatchIndicator
                      percentage={m.matchPercentage}
                      variant="compact"
                      showLabel={true}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<ArrowRight className="w-3.5 h-3.5" />}
                      onClick={() => navigate(`/job/${m.job.id}`)}
                    >
                      View Job
                    </Button>
                  </div>
                </div>

                {/* Progress Meter with smooth width transition */}
                <div>
                  <MatchIndicator
                    percentage={m.matchPercentage}
                    variant="meter"
                    showLabel={false}
                  />
                </div>

                {/* Top Matching Skills */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-medium mr-1">
                    Matching skills:
                  </span>
                  {m.matchedSkills.length === 0 ? (
                    <span className="text-[11px] text-slate-400 italic">No direct matches</span>
                  ) : (
                    m.matchedSkills.slice(0, 4).map(ms => (
                      <span
                        key={ms.skill.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold"
                      >
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        <span>{ms.skill.name}</span>
                      </span>
                    ))
                  )}
                  {m.matchedSkills.length > 4 && (
                    <span className="text-[11px] text-slate-400 font-medium">
                      +{m.matchedSkills.length - 4} more
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Skill Gap Summary + Profile Summary + Optional Graph Visual */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. SKILL GAP SUMMARY */}
          <Card className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Your Skill Gaps
              </h2>
              <button
                onClick={() => navigate('/skills')}
                className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                Explore Skills
              </button>
            </div>

            {topSkillGaps.length === 0 ? (
              <p className="text-xs text-emerald-700 font-semibold py-4 text-center">
                Zero skill gaps! You meet 100% of required competencies.
              </p>
            ) : (
              <div className="space-y-2.5">
                {topSkillGaps.map(gap => (
                  <div
                    key={gap.skill.id}
                    className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">
                        {gap.skill.name}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Required in {gap.count} {gap.count === 1 ? 'job' : 'jobs'}
                      </span>
                    </div>

                    <button
                      onClick={() => navigate('/skills')}
                      className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    >
                      Learn
                    </button>
                  </div>
                ))}

                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<ArrowRight className="w-3.5 h-3.5" />}
                    onClick={() => navigate('/skills')}
                    className="w-full text-xs"
                  >
                    Explore Skills
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* 2. PROFILE SUMMARY COMPACT CARD */}
          <Card className="p-5 sm:p-6 space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Profile Summary
              </h2>
              <button
                onClick={() => navigate('/profile')}
                className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                Edit Profile
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Current Location
                </span>
                <span className="font-bold text-slate-800">
                  {activeStudent.preferredLocation || 'Pune'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  Education
                </span>
                <span className="font-bold text-slate-800">
                  {activeStudent.degree || 'BCA'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Experience
                </span>
                <span className="font-bold text-slate-800">
                  {activeStudent.experienceLevel || 'Fresher'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                  Number of Skills
                </span>
                <span className="font-bold text-blue-600 tabular-nums">
                  {totalSkillsCount} Skills
                </span>
              </div>
            </div>
          </Card>

          {/* 3. DASHBOARD MINI GRAPH VISUALIZATION */}
          <GraphMotif
            topLabel="Java"
            topType="Skill"
            bottomLabel="Python"
            bottomType="Skill"
            leftLabel={displayName || "Student"}
            leftType="Student"
            rightLabel="Backend Dev"
            rightType="Job"
            badgeLabel="Graph-Based Matching"
            variant="compact"
            caption="(:Student)-[:HAS_SKILL]->(:Skill)<-[:REQUIRES_SKILL]-(:Job)"
          />
        </div>
      </div>
    </div>
  );
};
