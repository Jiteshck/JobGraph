import React, { useState } from 'react';
import {
  StudentNode,
  BridgeSkillAnalysis,
  JobMatchCalculation
} from '../types/graph';
import {
  SkillChip,
  MatchIndicator,
  Button,
  Card,
  Badge
} from './design-system/DesignTokens';
import {
  Lightbulb,
  ArrowRight,
  Briefcase,
  Zap,
  CheckCircle2,
  Code2,
  Share2,
  Sparkles
} from 'lucide-react';

interface BridgeSkillsViewProps {
  activeStudent: StudentNode;
  bridgeSkills: BridgeSkillAnalysis[];
  matches: JobMatchCalculation[];
  onLearnSkill: (skillId: string) => void;
  onNavigateToMatches: () => void;
}

export const BridgeSkillsView: React.FC<BridgeSkillsViewProps> = ({
  activeStudent,
  bridgeSkills,
  matches,
  onLearnSkill,
  onNavigateToMatches
}) => {
  const [selectedBridgeId, setSelectedBridgeId] = useState<string>(
    bridgeSkills[0]?.skill.id || ''
  );
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const selectedBridge =
    bridgeSkills.find(b => b.skill.id === selectedBridgeId) || bridgeSkills[0];

  const handleAcquire = (skillId: string, skillName: string) => {
    onLearnSkill(skillId);
    setSuccessNotice(`Skill "${skillName}" acquired! Graph relationships and match scores have been updated.`);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <Card className="p-6 sm:p-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">
            <Lightbulb className="w-4 h-4" />
            Graph Centrality & Career Bridge Intelligence
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
            High-Impact Career Bridge Skills
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Rather than learning skills at random, JOBGRAPH uses bipartite graph centrality to discover which single missing competencies will unlock the greatest number of job vacancies for <strong className="text-slate-800">{activeStudent.name}</strong>.
          </p>
        </div>

        {successNotice && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}
      </Card>

      {bridgeSkills.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">Zero Skill Gaps Remaining</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {activeStudent.name} has already acquired all skills required by every job currently stored in the graph database.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Ranked Bridge Skills List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Recommended Bridge Priorities
              </span>
              <span>{bridgeSkills.length} missing analyzed</span>
            </div>

            {bridgeSkills.map((bridge, index) => {
              const isSelected = selectedBridge?.skill.id === bridge.skill.id;
              return (
                <div
                  key={bridge.skill.id}
                  onClick={() => setSelectedBridgeId(bridge.skill.id)}
                  className={`p-4 sm:p-5 bg-white border rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-500/10 shadow-sm'
                      : 'border-slate-200/90 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                        <span className="font-mono font-bold text-blue-600">Rank #{index + 1}</span>
                        <span>·</span>
                        <span>{bridge.skill.category}</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900">
                        {bridge.skill.name}
                      </h4>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-emerald-600 tabular-nums">
                        +{bridge.averageBoostPercentage}%
                      </span>
                      <div className="text-[10px] text-slate-400">Avg Boost</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                    {bridge.skill.description}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-2.5 border-t border-slate-100">
                    <span className="text-slate-600 font-semibold tabular-nums">
                      Unlocks {bridge.totalUnlockCount} job roles
                    </span>
                    <SkillChip name="Bridge Skill" variant="recommended" size="sm" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed Bridge Impact Inspector */}
          <div className="lg:col-span-7">
            {selectedBridge && (
              <Card className="p-6 sm:p-7 space-y-6">
                <div className="border-b border-slate-100 pb-5">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <Badge variant="primary" icon={<Sparkles className="w-3 h-3" />}>
                      Recommended Bridge Candidate
                    </Badge>
                    <span className="text-slate-500 font-medium">Demand: {selectedBridge.skill.marketDemand}</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                    {selectedBridge.skill.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                    {selectedBridge.skill.description}
                  </p>

                  {/* Impact Summary Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-blue-50/40 border border-blue-200/80 rounded-xl text-center text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px] font-semibold">Jobs Unlocked</span>
                      <span className="text-lg font-bold text-slate-900 tabular-nums">
                        {selectedBridge.totalUnlockCount} Roles
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px] font-semibold">Avg Match Boost</span>
                      <span className="text-lg font-bold text-emerald-600 tabular-nums">
                        +{selectedBridge.averageBoostPercentage}%
                      </span>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-slate-500 block text-[11px] font-semibold">Skill Category</span>
                      <span className="text-lg font-bold text-blue-600 truncate block">
                        {selectedBridge.skill.category}
                      </span>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Button
                      variant="primary"
                      icon={<Zap className="w-3.5 h-3.5 text-amber-300" />}
                      onClick={() => handleAcquire(selectedBridge.skill.id, selectedBridge.skill.name)}
                    >
                      Add "{selectedBridge.skill.name}" to Student Graph
                    </Button>
                    <Button
                      variant="outline"
                      onClick={onNavigateToMatches}
                    >
                      View All Current Matches
                    </Button>
                  </div>
                </div>

                {/* Target Jobs Benefiting from this Bridge Skill */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                    Impact Across Target Job Postings
                  </h4>

                  <div className="space-y-2.5">
                    {selectedBridge.potentialUnlockJobs.map(pj => (
                      <div
                        key={pj.job.id}
                        className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl text-xs flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{pj.job.title}</div>
                          <div className="text-[11px] text-slate-500">{pj.job.company} · {pj.job.experienceLevel}</div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 tabular-nums line-through">{pj.currentMatch}%</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span className="font-bold text-emerald-600 tabular-nums text-sm">{pj.projectedMatch}%</span>
                          </div>
                          <span className="text-[11px] text-emerald-700 font-bold">+{pj.gain}% boost</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Graph Synergy Paths */}
                {selectedBridge.coOccurringSkills.length > 0 && (
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Share2 className="w-3.5 h-3.5 text-blue-600" />
                      Graph Co-occurrence & Technical Synergy
                    </div>
                    <p className="text-xs text-slate-500">
                      In real-world job architectures, acquiring <strong className="text-slate-800">{selectedBridge.skill.name}</strong> naturally complements:
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {selectedBridge.coOccurringSkills.map(syn => (
                        <SkillChip
                          key={syn}
                          name={syn}
                          variant="neutral"
                          size="sm"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
