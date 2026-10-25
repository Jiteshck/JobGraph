import React, { useState } from 'react';
import {
  StudentNode,
  JobMatchCalculation,
  JobNode,
  ProficiencyLevel,
  RequirementImportance
} from '../types/graph';
import {
  MatchIndicator,
  SkillChip,
  Badge,
  Button,
  Card
} from './design-system/DesignTokens';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Briefcase,
  Search,
  Filter,
  ArrowRight,
  Code2,
  Sparkles,
  Zap,
  GraduationCap,
  MapPin,
  Clock
} from 'lucide-react';

interface MatchGapEngineProps {
  activeStudent: StudentNode;
  matches: JobMatchCalculation[];
  onSimulateLearnSkill: (skillId: string) => void;
  onOpenGraphWithJob: (jobId: string) => void;
}

export const MatchGapEngine: React.FC<MatchGapEngineProps> = ({
  activeStudent,
  matches,
  onSimulateLearnSkill,
  onOpenGraphWithJob
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string>(matches[0]?.job.id || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterThreshold, setFilterThreshold] = useState<'all' | '50' | '75'>('all');
  const [cgpaOnly, setCgpaOnly] = useState<boolean>(false);
  const [showCypherSnippet, setShowCypherSnippet] = useState<boolean>(false);

  // Filtered jobs
  const filteredMatches = matches.filter(m => {
    const matchesSearch =
      m.job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.job.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesThreshold =
      filterThreshold === 'all' ? true :
      filterThreshold === '50' ? m.matchPercentage >= 50 :
      m.matchPercentage >= 75;

    const matchesCgpa = cgpaOnly ? m.cgpaEligible : true;

    return matchesSearch && matchesThreshold && matchesCgpa;
  });

  const selectedMatch = matches.find(m => m.job.id === selectedJobId) || matches[0];

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card className="p-5 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
              Core Bipartite Matching Engine
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Skill Matching & Gap Analysis
            </h2>
            <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-1.5">
              <span>Evaluating graph adjacency for <strong className="text-slate-800">{activeStudent.name}</strong></span>
              <span>·</span>
              <span>Roll: {activeStudent.rollNo}</span>
              <span>·</span>
              <span>CGPA: {activeStudent.cgpa} / 10.0</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={showCypherSnippet ? 'primary' : 'outline'}
              size="sm"
              icon={<Code2 className="w-3.5 h-3.5" />}
              onClick={() => setShowCypherSnippet(!showCypherSnippet)}
            >
              {showCypherSnippet ? 'Hide Cypher Pattern' : 'Show Match Cypher'}
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 text-xs">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by role title or company..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-colors"
            />
          </div>

          {/* Segmented control for threshold */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setFilterThreshold('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                filterThreshold === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Matches
            </button>
            <button
              onClick={() => setFilterThreshold('50')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                filterThreshold === '50'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ≥ 50% Match
            </button>
            <button
              onClick={() => setFilterThreshold('75')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                filterThreshold === '75'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ≥ 75% Strong
            </button>
          </div>

          {/* CGPA Eligibility Toggle */}
          <button
            onClick={() => setCgpaOnly(!cgpaOnly)}
            className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
              cgpaOnly
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-slate-300 text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            CGPA Eligible Only
          </button>
        </div>

        {/* Cypher Pattern Drawer */}
        {showCypherSnippet && (
          <div className="p-4 bg-slate-950 text-slate-200 rounded-xl border border-slate-800 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
              <span className="text-blue-400 font-semibold">Cypher Bipartite Matching Pattern</span>
              <span className="text-[11px]">Neo4j 5.x Index-Free Adjacency</span>
            </div>
            <pre className="overflow-x-auto text-[11px] leading-relaxed text-emerald-400">
{`MATCH (s:Student {id: '${activeStudent.id}'})-[:HAS_SKILL]->(sk:Skill)<-[r:REQUIRES_SKILL]-(j:Job)
WITH j, count(sk) AS matchedCount, collect(sk.name) AS matchedSkills
MATCH (j)-[req:REQUIRES_SKILL]->(allSk:Skill)
WITH j, matchedCount, matchedSkills, count(allSk) AS totalRequired, collect(allSk.name) AS allJobSkills
RETURN j.title,
       round((toFloat(matchedCount) / totalRequired) * 100, 1) AS matchPercentage,
       [skill IN allJobSkills WHERE NOT skill IN matchedSkills] AS missingSkills;`}
            </pre>
          </div>
        )}
      </Card>

      {/* Main Grid: Job Cards (Left) + Detailed Gap Analysis Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Ranked Job Recommendations List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
              Ranked Job Vacancies ({filteredMatches.length})
            </span>
            <span>Sorted by Graph Overlap</span>
          </div>

          {filteredMatches.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-xs font-semibold text-slate-700">No jobs match your filter criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterThreshold('all');
                  setCgpaOnly(false);
                }}
                className="mt-3 text-xs text-blue-600 font-semibold hover:underline"
              >
                Reset All Filters
              </button>
            </Card>
          ) : (
            filteredMatches.map((m, idx) => {
              const isSelected = selectedJobId === m.job.id;

              return (
                <div
                  key={m.job.id}
                  onClick={() => setSelectedJobId(m.job.id)}
                  className={`p-4 sm:p-5 bg-white border rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-500/10 shadow-sm'
                      : 'border-slate-200/90 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                        <span className="font-mono font-bold text-slate-600">#{idx + 1}</span>
                        <span>·</span>
                        <span className="font-medium text-slate-700">{m.job.company}</span>
                        <span>·</span>
                        <span>{m.job.location}</span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        {m.job.title}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <MatchIndicator percentage={m.matchPercentage} variant="compact" showLabel={false} />
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="my-3">
                    <MatchIndicator percentage={m.matchPercentage} variant="meter" showLabel={true} />
                  </div>

                  {/* Clean unboxed metadata footer */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2.5 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-700 font-semibold tabular-nums">
                        {m.matchedCount} matched
                      </span>
                      <span>·</span>
                      <span className="text-rose-700 font-semibold tabular-nums">
                        {m.missingCount} missing
                      </span>
                    </div>

                    <div>
                      {m.cgpaEligible ? (
                        <span className="text-emerald-700 font-medium text-[11px]">
                          CGPA Eligible
                        </span>
                      ) : (
                        <span className="text-amber-700 font-medium text-[11px]">
                          Min {m.job.minCgpa} CGPA
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Deep-Dive Gap Analysis Inspector */}
        <div className="lg:col-span-7">
          {selectedMatch ? (
            <Card className="p-6 sm:p-7 space-y-6">
              {/* Job Header */}
              <div className="border-b border-slate-100 pb-5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" icon={<Briefcase className="w-3 h-3" />}>
                      {selectedMatch.job.department}
                    </Badge>
                    <Badge variant="default" icon={<Clock className="w-3 h-3" />}>
                      {selectedMatch.job.experienceLevel}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<ArrowRight className="w-3.5 h-3.5" />}
                    onClick={() => onOpenGraphWithJob(selectedMatch.job.id)}
                  >
                    View in Graph Visualizer
                  </Button>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1.5">
                  {selectedMatch.job.title}
                </h3>
                <div className="text-xs text-slate-500 mb-3 flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-slate-700">{selectedMatch.job.company}</span>
                  <span>·</span>
                  <span>{selectedMatch.job.location}</span>
                  <span>·</span>
                  <span>Minimum Academic CGPA: <strong className="text-slate-800">{selectedMatch.job.minCgpa}</strong></span>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {selectedMatch.job.description}
                </p>

                {/* Match Score Gauge Banner */}
                <div className="mt-5 p-4 bg-slate-50 border border-slate-200/90 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div className="flex justify-center sm:justify-start">
                    <MatchIndicator percentage={selectedMatch.matchPercentage} variant="circle" size="md" />
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">
                      Weighted Score
                    </span>
                    <span className="text-xl font-bold text-blue-600 tabular-nums">
                      {selectedMatch.weightedScore}%
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Proficiency adjusted
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">
                      Academic Eligibility
                    </span>
                    <span className={`text-xl font-bold tabular-nums ${
                      selectedMatch.cgpaEligible ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {selectedMatch.cgpaEligible ? 'Eligible' : 'Below Cutoff'}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Student: {activeStudent.cgpa} / {selectedMatch.job.minCgpa}
                    </span>
                  </div>
                </div>
              </div>

              {/* Side-by-Side: Matched Skills vs Missing Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Column 1: Matched Skills (S ∩ J) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Matched Skills ({selectedMatch.matchedCount})
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold">Satisfied</span>
                  </div>

                  {selectedMatch.matchedSkills.length === 0 ? (
                    <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-500 text-center">
                      No skills currently match this job requirements.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {selectedMatch.matchedSkills.map(ms => (
                        <div
                          key={ms.skill.id}
                          className="p-3 bg-emerald-50/50 border border-emerald-200/90 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div>
                            <SkillChip
                              name={ms.skill.name}
                              variant="existing"
                              proficiency={ms.studentProficiency}
                              size="sm"
                            />
                            <div className="text-[10px] text-emerald-800 mt-1 pl-1">
                              Req: {ms.minProficiency} · {ms.requiredImportance}
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-emerald-700 font-bold">
                            OK
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Column 2: Missing Skills (Skill Gap Set J \ S) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      Missing Skills Gap ({selectedMatch.missingCount})
                    </span>
                    <span className="text-[11px] text-rose-700 font-semibold">Need Acquisition</span>
                  </div>

                  {selectedMatch.missingSkills.length === 0 ? (
                    <div className="p-4 bg-emerald-50 rounded-xl text-xs text-emerald-800 text-center font-semibold">
                      Zero skill gap! Student meets 100% of required competencies.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {selectedMatch.missingSkills.map(ms => {
                        const isMandatory = ms.requiredImportance === 'MANDATORY';
                        return (
                          <div
                            key={ms.skill.id}
                            className={`p-3 rounded-xl border text-xs space-y-2 ${
                              isMandatory
                                ? 'bg-rose-50/40 border-rose-200'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <SkillChip
                                name={ms.skill.name}
                                variant="missing"
                                importance={ms.requiredImportance}
                                size="sm"
                              />
                              <span className="text-[10px] text-slate-500 font-medium">
                                Req: {ms.minProficiency}
                              </span>
                            </div>

                            {/* "What If" Simulator Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<Zap className="w-3 h-3 text-blue-600" />}
                              onClick={() => onSimulateLearnSkill(ms.skill.id)}
                              className="w-full text-[11px]"
                            >
                              Simulate Adding "{ms.skill.name}"
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-sm text-slate-500">Select a job from the list to view detailed skill gap analysis.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
