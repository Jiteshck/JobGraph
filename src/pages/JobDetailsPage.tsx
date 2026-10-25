import React, { useState } from 'react';
import { useRouter } from '../router/RouterContext';
import {
  StudentNode,
  JobMatchCalculation,
  JobNode
} from '../types/graph';
import {
  MatchIndicator,
  Button,
  Card,
  Badge,
  GraphMotif
} from '../components/design-system';
import { AnimatedCounter } from '../components/design-system/Motion';
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  IndianRupee,
  Check,
  X,
  Building2,
  Clock,
  Sparkles,
  HelpCircle,
  TrendingUp,
  FileText
} from 'lucide-react';

interface JobDetailsPageProps {
  activeStudent: StudentNode;
  matches: JobMatchCalculation[];
  jobs: JobNode[];
  onSimulateLearnSkill?: (skillId: string) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const JobDetailsPage: React.FC<JobDetailsPageProps> = ({
  activeStudent,
  matches,
  jobs,
  onSimulateLearnSkill,
  isLoading = false,
  error = null,
  onRetry
}) => {
  const { params, navigate } = useRouter();
  const jobId = params.id || matches[0]?.job.id;

  // Find corresponding job and match calculation
  const currentMatch = matches.find(m => m.job.id === jobId);
  const matchedJob = currentMatch?.job || jobs.find(j => j.id === jobId);

  // Compute skill frequency among all jobs (to show "Required by X jobs")
  const skillFrequency = React.useMemo(() => {
    const map = new Map<string, number>();
    matches.forEach(m => {
      m.matchedSkills.forEach(ms => {
        map.set(ms.skill.id, (map.get(ms.skill.id) || 0) + 1);
      });
      m.missingSkills.forEach(ms => {
        map.set(ms.skill.id, (map.get(ms.skill.id) || 0) + 1);
      });
    });
    return map;
  }, [matches]);

  // LOADING STATE: Skeleton version of the page
  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
        {/* Back button skeleton */}
        <div className="h-8 w-28 bg-slate-200 rounded-md" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-slate-200 rounded-2xl" />
            <div className="h-64 bg-slate-200 rounded-2xl" />
            <div className="h-40 bg-slate-200 rounded-2xl" />
          </div>

          {/* Side Column */}
          <div className="space-y-6">
            <div className="h-72 bg-slate-200 rounded-2xl" />
            <div className="h-44 bg-slate-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (error || (!matchedJob && !isLoading)) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <Card className="p-8 text-center space-y-4 border-rose-200 bg-rose-50/30">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <X className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Job details could not be loaded.</h2>
          <p className="text-xs text-slate-500">
            {error || 'The requested job was not found in the graph database or may have been removed.'}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                Retry
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={() => navigate('/jobs')}>
              Back to Jobs
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const job = matchedJob!;
  const matchPercentage = currentMatch ? currentMatch.matchPercentage : 0;
  const matchedSkills = currentMatch?.matchedSkills || [];
  const missingSkills = currentMatch?.missingSkills || [];
  const totalRequired = matchedSkills.length + missingSkills.length;
  const matchedCount = matchedSkills.length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10 animate-page-entrance">
      {/* TOP: Back button: ← Back to Jobs */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/jobs')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer group px-1 py-1"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Jobs
        </button>
        <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          GET /api/jobs/{jobId}
        </span>
      </div>

      {/* JOB HEADER: Backend Developer | ABC Technologies | Pune | ₹4–8 LPA | Full Time | Experience: Fresher */}
      <Card className="p-6 sm:p-8 bg-white border border-slate-200 shadow-sm rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <Building2 className="w-3.5 h-3.5" />
                {job.company}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {job.location}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {job.jobType || 'Full Time'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                Experience: {job.experienceLevel || 'Fresher'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {job.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
              <span className="font-semibold text-slate-900 flex items-center gap-1">
                <Building2 className="w-4 h-4 text-slate-400" />
                {job.company}
              </span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-slate-400" />
                {job.location}
              </span>
              {job.salaryRange && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                    <IndianRupee className="w-3 h-3" />
                    {job.salaryRange}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Quick Match Ribbon for Desktop */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 bg-blue-50/60 sm:bg-transparent p-4 sm:p-0 rounded-xl border sm:border-0 border-blue-100">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Compatibility
            </span>
            <span className="text-3xl font-extrabold text-blue-600 tabular-nums">
              <AnimatedCounter value={matchPercentage} suffix="%" />
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {matchedCount} of {totalRequired} skills match
            </span>
          </div>
        </div>

        {/* Highlight Summary Pills */}
        <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block font-medium">Department</span>
            <span className="font-bold text-slate-800 text-sm">{job.department}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block font-medium">Job Type</span>
            <span className="font-bold text-slate-800 text-sm">{job.jobType || 'Full Time'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block font-medium">Experience Level</span>
            <span className="font-bold text-slate-800 text-sm">{job.experienceLevel || 'Fresher'}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block font-medium">Min Academic CGPA</span>
            <span className="font-bold text-slate-800 text-sm">{job.minCgpa}</span>
          </div>
        </div>
      </Card>

      {/* TWO-COLUMN LAYOUT (Desktop) / SINGLE COLUMN (Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT / MAIN COLUMN: Skill Comparison, Skill Gap Section, Job Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* SKILL COMPARISON: Section: "Required Skills" */}
          <Card className="p-6 sm:p-7 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Required Skills</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Clear visual comparison of your profile skills against requirements.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <Check className="w-3.5 h-3.5" /> {matchedSkills.length} Matched
                </span>
                <span className="flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  <X className="w-3.5 h-3.5" /> {missingSkills.length} Missing
                </span>
              </div>
            </div>

            {/* Matched Skills List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Matched Skills ({matchedSkills.length})
              </h3>
              {matchedSkills.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 italic bg-slate-50 p-4 rounded-xl border border-slate-100">
                  No matching skills found between your profile and this position.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {matchedSkills.map((ms, idx) => (
                    <div
                      key={ms.skill.id}
                      className={`p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs animate-chip-entrance stagger-${Math.min(idx + 1, 6)}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </span>
                        <div className="min-w-0">
                          <div className="font-bold text-emerald-950 truncate">
                            {ms.skill.name}
                          </div>
                          <div className="text-[10px] text-emerald-700">
                            Required: {ms.minProficiency} · {ms.requiredImportance}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                        Matched
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Missing Skills List */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Missing Skills ({missingSkills.length})
              </h3>
              {missingSkills.length === 0 ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Great job! You possess all the skills required for this job.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {missingSkills.map((ms, idx) => {
                    const reqCount = skillFrequency.get(ms.skill.id) || 1;
                    return (
                      <div
                        key={ms.skill.id}
                        className={`p-3 bg-rose-50/60 border border-rose-200 rounded-xl flex items-center justify-between text-xs animate-chip-entrance stagger-${Math.min(idx + 1, 6)}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                            <X className="w-3.5 h-3.5 stroke-[2.5]" />
                          </span>
                          <div className="min-w-0">
                            <div className="font-bold text-rose-950 truncate">
                              {ms.skill.name}
                            </div>
                            <div className="text-[10px] text-rose-600">
                              Required: {ms.minProficiency} · {ms.requiredImportance}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-bold tracking-wider uppercase text-rose-700 bg-rose-100 px-2 py-0.5 rounded block">
                            Missing
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>

          {/* SKILL GAP SECTION: Title: "What You're Missing" */}
          <Card className="p-6 sm:p-7 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">What You're Missing</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Acquiring these key competencies will elevate your match rate for this job and related positions.
                </p>
              </div>
            </div>

            {missingSkills.length === 0 ? (
              <p className="text-xs text-emerald-700 py-3 font-medium">
                No skill gaps identified for this role.
              </p>
            ) : (
              <div className="space-y-3">
                {missingSkills.map(ms => {
                  const jobCount = skillFrequency.get(ms.skill.id) || 1;
                  return (
                    <div
                      key={ms.skill.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-200 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {ms.skill.name}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            Required by {jobCount} {jobCount === 1 ? 'job' : 'jobs'}
                          </span>
                        </div>
                        <p className="text-slate-500 text-xs line-clamp-1">
                          {ms.skill.description || `Key competency categorized under ${ms.skill.category}.`}
                        </p>
                      </div>

                      {onSimulateLearnSkill && (
                        <button
                          onClick={() => onSimulateLearnSkill(ms.skill.id)}
                          className="shrink-0 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                          Simulate Learning
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* JOB DESCRIPTION: Display the job description from the database */}
          <Card className="p-6 sm:p-7 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Job Description</h2>
            </div>

            <div className="text-sm text-slate-700 leading-relaxed space-y-3">
              <p className="whitespace-pre-line">
                {job.description}
              </p>
            </div>
          </Card>
        </div>

        {/* RIGHT / SIDE COLUMN: MAIN MATCH CARD & COMPANY SECTION */}
        <div className="space-y-6">
          {/* MAIN MATCH CARD:
              "Your Match"
              Large: 83%
              Circular or horizontal progress indicator.
              Supporting text: "Your skills match 5 of 6 required skills."
          */}
          <Card className="p-6 sm:p-7 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Your Match</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated against graph relationships
              </p>
            </div>

            {/* Large 83% display with progress indicator */}
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              <div className="relative flex items-center justify-center">
                <MatchIndicator
                  percentage={matchPercentage}
                  variant="circle"
                  size="lg"
                />
              </div>

              <div className="text-center space-y-1">
                <div className="text-4xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                  <AnimatedCounter value={matchPercentage} suffix="%" />
                </div>
                <p className="text-sm font-medium text-slate-700">
                  Your skills match {matchedCount} of {totalRequired} required skills.
                </p>
              </div>
            </div>

            {/* Horizontal progress bar indicator */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Skill Match Progress</span>
                <span className="tabular-nums font-bold text-blue-600">{matchPercentage}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${matchPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>0%</span>
                <span>Cutoff: 60%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Academic Eligibility verification */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
              <span className="font-bold text-slate-700 block">Academic Eligibility</span>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Student CGPA: {activeStudent.cgpa}</span>
                <span className="text-slate-500">Cutoff: {job.minCgpa}</span>
              </div>
              <div className="text-[11px] font-semibold text-emerald-700 pt-1">
                ✓ Academic criteria fulfilled
              </div>
            </div>
          </Card>

          {/* COMPANY SECTION:
              ABC Technologies
              Industry: Information Technology
              Location: Pune
          */}
          <Card className="p-6 sm:p-7 bg-white border border-slate-200 shadow-sm rounded-2xl space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Company Information</h2>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Company Name</span>
                <span className="text-base font-bold text-slate-900">{job.company}</span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Industry</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {job.department || 'Information Technology'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Location</span>
                <span className="font-semibold text-slate-800 text-sm flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {job.location}
                </span>
              </div>
            </div>
          </Card>

          {/* Graph Relationship Motif */}
          <GraphMotif
            topLabel="Java"
            topType="Skill"
            bottomLabel="Python"
            bottomType="Skill"
            leftLabel={activeStudent?.name?.split(' ')[0] || "Student"}
            leftType="Student"
            rightLabel={job.title}
            rightType="Job"
            badgeLabel="Skill Relationships"
            variant="compact"
            caption="Direct Neo4j relationship path verified"
          />
        </div>
      </div>

      {/* BOTTOM CTA: [Find Other Jobs] */}
      {/* (Do NOT add: Apply Now, Bookmark, Share, Contact recruiter, Message company, Application form) */}
      <div className="pt-6 border-t border-slate-200 flex justify-center">
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/jobs')}
          className="px-8 shadow-sm"
        >
          Find Other Jobs
        </Button>
      </div>
    </div>
  );
};
