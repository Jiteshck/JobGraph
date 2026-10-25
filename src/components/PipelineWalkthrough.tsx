import React, { useState } from 'react';
import {
  StudentNode,
  JobMatchCalculation,
  BridgeSkillAnalysis,
  SkillNode,
  ProficiencyLevel
} from '../types/graph';
import {
  MatchIndicator,
  SkillChip,
  Button,
  Card,
  Badge
} from './design-system/DesignTokens';
import {
  User,
  Sparkles,
  Share2,
  Briefcase,
  Percent,
  AlertTriangle,
  Lightbulb,
  Award,
  ArrowRight,
  ArrowDown,
  Code2,
  CheckCircle2,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface PipelineWalkthroughProps {
  activeStudent: StudentNode;
  studentSkills: Array<{ skill: SkillNode; proficiency: ProficiencyLevel }>;
  matches: JobMatchCalculation[];
  bridgeSkills: BridgeSkillAnalysis[];
  onNavigateToTab: (tabId: string) => void;
  onSelectJobForDetail: (jobId: string) => void;
}

export const PipelineWalkthrough: React.FC<PipelineWalkthroughProps> = ({
  activeStudent,
  studentSkills,
  matches,
  bridgeSkills,
  onNavigateToTab,
  onSelectJobForDetail
}) => {
  const [selectedStep, setSelectedStep] = useState<number>(0);

  const topMatch = matches[0];
  const topBridge = bridgeSkills[0];
  const missingCount = topMatch ? topMatch.missingCount : 0;

  const pipelineSteps = [
    {
      step: 1,
      title: 'Student Profile',
      subtitle: 'Node Label: :Student',
      description: 'The starting entity representing an enrolled BCA student with academic metadata.',
      icon: User,
      dataBadge: `${activeStudent.name} (${activeStudent.rollNo})`,
      color: 'border-blue-500 text-blue-600 bg-blue-50/50',
      cypher: `CREATE (s:Student {
  id: '${activeStudent.id}',
  name: '${activeStudent.name}',
  rollNo: '${activeStudent.rollNo}',
  cgpa: ${activeStudent.cgpa},
  targetRole: '${activeStudent.targetRole}'
})`,
      details: (
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Degree & Semester:</span>
            <span className="font-semibold text-slate-800">{activeStudent.degree} · Sem {activeStudent.semester}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Academic CGPA:</span>
            <span className="font-bold text-slate-900 tabular-nums">{activeStudent.cgpa} / 10.0</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Target Specialization:</span>
            <span className="font-semibold text-blue-600">{activeStudent.targetRole}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500 font-medium">Institutional Email:</span>
            <span className="font-mono text-slate-600">{activeStudent.email}</span>
          </div>
        </div>
      )
    },
    {
      step: 2,
      title: 'Student Skills',
      subtitle: 'Node Label: :Skill',
      description: 'Discrete technical competencies acquired by the student with verified proficiency.',
      icon: Sparkles,
      dataBadge: `${studentSkills.length} Verified Skills Acquired`,
      color: 'border-indigo-500 text-indigo-600 bg-indigo-50/50',
      cypher: `MATCH (s:Student {id: '${activeStudent.id}'})
MATCH (sk:Skill) WHERE sk.id IN [${studentSkills.slice(0, 3).map(s => `'${s.skill.id}'`).join(', ')}...]
RETURN s.name, collect(sk.name);`,
      details: (
        <div className="space-y-2">
          <div className="text-xs text-slate-500 font-medium">Acquired competencies in student graph node:</div>
          <div className="flex flex-wrap gap-1.5">
            {studentSkills.map(({ skill, proficiency }) => (
              <SkillChip
                key={skill.id}
                name={skill.name}
                variant="existing"
                proficiency={proficiency}
                size="sm"
              />
            ))}
          </div>
        </div>
      )
    },
    {
      step: 3,
      title: 'Neo4j Graph Relationships',
      subtitle: 'Edge: [:HAS_SKILL] & [:REQUIRES_SKILL]',
      description: 'Directed graph edges linking students and jobs via shared skill nodes in the graph model.',
      icon: Share2,
      dataBadge: `Index-Free Adjacency Pointers`,
      color: 'border-sky-500 text-sky-600 bg-sky-50/50',
      cypher: `// Bipartite Graph Traversal Pattern
MATCH (s:Student {id: $id})-[:HAS_SKILL]->(sk:Skill)<-[:REQUIRES_SKILL]-(j:Job)
RETURN s.name, sk.name, j.title;`,
      details: (
        <div className="text-xs space-y-2 text-slate-600">
          <p>
            Unlike relational SQL which must execute multi-table <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded font-mono">JOIN</code> operations across four separate tables, Neo4j traversals follow direct double-hop memory pointers.
          </p>
          <div className="p-2.5 bg-slate-100 rounded-lg text-slate-700 font-mono text-[11px] leading-relaxed">
            (:Student) ──[:HAS_SKILL]──&gt; (:Skill) &lt;──[:REQUIRES_SKILL]── (:Job)
          </div>
          <p className="text-[11px] text-slate-500">
            Traversal complexity is <strong className="text-slate-700">O(degree)</strong>, completely independent of total database size.
          </p>
        </div>
      )
    },
    {
      step: 4,
      title: 'Job Requirements',
      subtitle: 'Node Label: :Job',
      description: 'Target employment opportunities defining mandatory and preferred skill dependencies.',
      icon: Briefcase,
      dataBadge: `${matches.length} Job Graph Nodes Available`,
      color: 'border-amber-500 text-amber-600 bg-amber-50/50',
      cypher: `MATCH (j:Job)-[r:REQUIRES_SKILL]->(sk:Skill)
RETURN j.title, r.importance, sk.name
ORDER BY j.title;`,
      details: (
        <div className="space-y-1.5 text-xs">
          <div className="text-slate-500 font-medium mb-1">Evaluated job postings in current graph schema:</div>
          {matches.slice(0, 3).map(m => (
            <div key={m.job.id} className="flex justify-between py-1 border-b border-slate-100">
              <span className="font-semibold text-slate-800">{m.job.title}</span>
              <span className="text-slate-500 tabular-nums">{m.totalRequiredCount} required skills</span>
            </div>
          ))}
        </div>
      )
    },
    {
      step: 5,
      title: 'Match Percentage',
      subtitle: 'Jaccard & Graph Overlap Metric',
      description: 'Calculates the intersection ratio between student skills and job requirements.',
      icon: Percent,
      dataBadge: `Top Match: ${topMatch ? `${topMatch.matchPercentage}%` : '0%'}`,
      color: 'border-emerald-500 text-emerald-600 bg-emerald-50/50',
      cypher: `WITH count(sk) AS matchedCount, j.requiredCount AS total
RETURN round((toFloat(matchedCount) / total) * 100, 1) AS matchPercentage;`,
      details: (
        <div className="space-y-2 text-xs">
          <p className="text-slate-600 font-medium">
            Mathematical formula executed inside Cypher query:
          </p>
          <div className="p-2 bg-slate-100 rounded-lg text-slate-800 font-mono text-[11px]">
            Match % = (|StudentSkills ∩ JobSkills| / |JobSkills|) × 100
          </div>
          {topMatch && (
            <div className="pt-2">
              <MatchIndicator percentage={topMatch.matchPercentage} variant="meter" showLabel={true} />
            </div>
          )}
        </div>
      )
    },
    {
      step: 6,
      title: 'Missing Skills',
      subtitle: 'Skill Gap Set Difference: J \\ S',
      description: 'Identifies specific required skills that the student has not yet acquired.',
      icon: AlertTriangle,
      dataBadge: `${missingCount} Missing Skills for Top Role`,
      color: 'border-rose-500 text-rose-600 bg-rose-50/50',
      cypher: `MATCH (j:Job {id: $jobId})-[r:REQUIRES_SKILL]->(sk:Skill)
WHERE NOT EXISTS {
  MATCH (s:Student {id: $studentId})-[:HAS_SKILL]->(sk)
}
RETURN sk.name, r.importance;`,
      details: (
        <div className="space-y-2 text-xs">
          <div className="text-slate-500 font-medium">Unsatisfied requirements for {topMatch?.job.title}:</div>
          {topMatch && topMatch.missingSkills.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {topMatch.missingSkills.map(ms => (
                <SkillChip
                  key={ms.skill.id}
                  name={ms.skill.name}
                  variant="missing"
                  importance={ms.requiredImportance}
                  size="sm"
                />
              ))}
            </div>
          ) : (
            <p className="text-emerald-600 font-semibold">All required skills are fully satisfied!</p>
          )}
        </div>
      )
    },
    {
      step: 7,
      title: 'Recommended Skills',
      subtitle: 'High-Impact Bridge Skills',
      description: 'Algorithmically identifies missing skills that unlock the most jobs upon acquisition.',
      icon: Lightbulb,
      dataBadge: topBridge ? `Bridge: ${topBridge.skill.name}` : 'No Gaps',
      color: 'border-amber-500 text-amber-600 bg-amber-50/50',
      cypher: `MATCH (s:Student {id: $id}), (missing:Skill)<-[:REQUIRES_SKILL]-(j:Job)
WHERE NOT (s)-[:HAS_SKILL]->(missing)
RETURN missing.name, count(DISTINCT j) AS unlockCount
ORDER BY unlockCount DESC LIMIT 3;`,
      details: (
        <div className="space-y-2 text-xs">
          {topBridge ? (
            <>
              <p className="text-slate-600">
                Acquiring <strong className="text-slate-900">{topBridge.skill.name}</strong> will simultaneously unlock or boost compatibility for <strong className="text-blue-600">{topBridge.totalUnlockCount} distinct jobs</strong>.
              </p>
              <div className="text-[11px] text-slate-500">
                Average Match Increase: <span className="font-bold text-emerald-600 tabular-nums">+{topBridge.averageBoostPercentage}%</span>
              </div>
            </>
          ) : (
            <p className="text-slate-500">No missing skills detected.</p>
          )}
        </div>
      )
    },
    {
      step: 8,
      title: 'Job Recommendations',
      subtitle: 'Ranked Graph Compatibility Output',
      description: 'Final personalized ranking of jobs ordered by Graph Overlap and Weighted Score.',
      icon: Award,
      dataBadge: topMatch ? `1st: ${topMatch.job.title}` : 'None',
      color: 'border-emerald-600 text-emerald-700 bg-emerald-50/50',
      cypher: `RETURN j.title, matchPercentage, weightedScore
ORDER BY matchPercentage DESC, weightedScore DESC;`,
      details: (
        <div className="space-y-2 text-xs">
          <div className="text-slate-500 font-medium">Ranked job opportunities for current student:</div>
          {matches.slice(0, 3).map((m, idx) => (
            <div key={m.job.id} className="flex items-center justify-between py-1 border-b border-slate-100">
              <div>
                <span className="font-semibold text-slate-800">#{idx + 1} {m.job.title}</span>
                <div className="text-[11px] text-slate-400">{m.job.company}</div>
              </div>
              <MatchIndicator percentage={m.matchPercentage} variant="compact" showLabel={false} />
            </div>
          ))}
        </div>
      )
    }
  ];

  const currentStepData = pipelineSteps[selectedStep];

  return (
    <div className="space-y-8">
      {/* Hero / Pipeline Concept Banner */}
      <Card className="p-6 sm:p-8">
        <div className="max-w-3xl">
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">
            Academic Project Architecture · Neo4j Graph Model
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
            Graph-Based Skill Matching & Gap Analysis Pipeline
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
            JOBGRAPH models students, technical skills, and industry job vacancies as a directed property graph. By traversing graph relationships rather than executing repetitive SQL joins, the system calculates instant match percentages, detects precise skill gaps, and recommends high-yield bridge skills.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 px-5 bg-slate-50 rounded-xl border border-slate-200/90 text-xs">
            <div>
              <span className="text-slate-500 block font-medium">Active Student</span>
              <span className="font-bold text-slate-900 truncate block text-sm">{activeStudent.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Acquired Skills</span>
              <span className="font-bold text-slate-900 tabular-nums text-sm">{studentSkills.length} Verified</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Top Match Score</span>
              <span className="font-bold text-emerald-600 tabular-nums text-sm">
                {topMatch ? `${topMatch.matchPercentage}%` : '0%'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Bridge Recommendation</span>
              <span className="font-bold text-blue-600 truncate block text-sm">
                {topBridge ? topBridge.skill.name : 'All Learned'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* The 8-Stage Concept Flow: Visual Step Strip */}
      <Card className="p-6 sm:p-7 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              The 8-Stage Academic Pipeline Walkthrough
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any stage below to inspect its graph transformation logic and Cypher implementation.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono font-medium">
            Stage {selectedStep + 1} of 8
          </span>
        </div>

        {/* Visual Pipeline Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {pipelineSteps.map((item, index) => {
            const isSelected = selectedStep === index;
            const Icon = item.icon;
            return (
              <button
                key={item.step}
                onClick={() => setSelectedStep(index)}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? `${item.color} shadow-xs border-current ring-2 ring-current/20 font-semibold`
                    : 'bg-slate-50/80 border-slate-200/90 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold opacity-75">
                    0{item.step}
                  </span>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="text-xs font-bold leading-tight line-clamp-1 mb-1">
                  {item.title}
                </div>
                <div className="text-[10px] text-slate-500 line-clamp-1">
                  {item.subtitle.split(':')[0]}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Step Deep Dive Inspector */}
        <div className="border border-slate-200/90 rounded-xl p-5 sm:p-6 bg-slate-50/50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Step Concept & Explanation */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800">
                  STAGE 0{currentStepData.step}
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  {currentStepData.subtitle}
                </span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">
                  {currentStepData.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {currentStepData.description}
                </p>
              </div>

              {/* Live Data Card */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
                <div className="text-xs font-bold text-slate-900 mb-2.5 flex items-center justify-between">
                  <span>Current Graph State</span>
                  <Badge variant="primary" size="sm">Live Evaluated</Badge>
                </div>
                {currentStepData.details}
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex items-center gap-2">
                {selectedStep > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedStep(s => s - 1)}
                  >
                    Previous Stage
                  </Button>
                )}
                {selectedStep < 7 ? (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<ArrowRight className="w-3.5 h-3.5" />}
                    onClick={() => setSelectedStep(s => s + 1)}
                  >
                    Next Stage
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<ExternalLink className="w-3.5 h-3.5" />}
                    onClick={() => onNavigateToTab('matches')}
                  >
                    Launch Match Engine
                  </Button>
                )}
              </div>
            </div>

            {/* Right: Academic Cypher Query Implementation */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-slate-500" />
                  Cypher Traversal Query Formulation
                </span>
                <span className="text-[11px] font-mono text-slate-400">Neo4j Bolt Protocol</span>
              </div>

              <div className="bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed shadow-xs">
                <pre className="text-emerald-400">{currentStepData.cypher}</pre>
              </div>

              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                <span className="font-bold block text-blue-950">Academic Viva Point:</span>
                <p className="text-blue-800">
                  In a relational database (RDBMS), joining students, skills, and jobs requires multiple nested hash-joins that scale with table size. In Neo4j, each node directly contains physical memory pointers to adjacent relationships, executing graph pattern matching in index-free adjacency time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Access to Main Engines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card
          hoverable
          onClick={() => onNavigateToTab('matches')}
          className="p-5 text-left group"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Percent className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center justify-between">
            Match & Gap Engine
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Examine matched skills vs missing skills side-by-side for each job role with weighted scoring.
          </p>
        </Card>

        <Card
          hoverable
          onClick={() => onNavigateToTab('graph')}
          className="p-5 text-left group"
        >
          <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-3 group-hover:bg-sky-600 group-hover:text-white transition-colors">
            <Share2 className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center justify-between">
            Interactive Graph Explorer
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors" />
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Visually traverse nodes and edges representing students, skills, and target job vacancies.
          </p>
        </Card>

        <Card
          hoverable
          onClick={() => onNavigateToTab('bridge')}
          className="p-5 text-left group"
        >
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <Lightbulb className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center justify-between">
            Recommended Bridge Skills
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Discover high-leverage skills that maximize total job qualification with minimal learning steps.
          </p>
        </Card>
      </div>
    </div>
  );
};
