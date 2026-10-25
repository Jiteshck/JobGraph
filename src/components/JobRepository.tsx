import React from 'react';
import {
  JobNode,
  SkillNode,
  JobSkillRel,
  StudentNode
} from '../types/graph';
import {
  SkillChip,
  Badge,
  Button,
  Card
} from './design-system/DesignTokens';
import {
  Briefcase,
  GraduationCap,
  MapPin,
  Building,
  CheckCircle2,
  ArrowRight,
  Clock
} from 'lucide-react';

interface JobRepositoryProps {
  jobs: JobNode[];
  skills: SkillNode[];
  jobSkills: JobSkillRel[];
  activeStudent: StudentNode;
  onSelectJobForMatch: (jobId: string) => void;
}

export const JobRepository: React.FC<JobRepositoryProps> = ({
  jobs,
  skills,
  jobSkills,
  activeStudent,
  onSelectJobForMatch
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 sm:p-7">
        <div>
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            Industry Opportunity Catalog
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Job Roles & Requirements Graph (:Job)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Industry employment opportunities modeled in Neo4j with <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px] text-slate-800">[:REQUIRES_SKILL &#123;importance, minProficiency&#125;]</code> dependency relationships.
          </p>
        </div>
      </Card>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {jobs.map(job => {
          const reqSkills = jobSkills.filter(r => r.jobId === job.id);
          const mandatoryCount = reqSkills.filter(r => r.importance === 'MANDATORY').length;
          const preferredCount = reqSkills.filter(r => r.importance === 'PREFERRED').length;

          return (
            <Card
              key={job.id}
              className="p-5 sm:p-6 flex flex-col justify-between hover:border-slate-300 transition-all hover:shadow-xs"
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                      <span className="font-semibold text-slate-800">{job.company}</span>
                      <span>·</span>
                      <span>{job.location}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {job.title}
                    </h3>
                  </div>

                  <Badge variant="default" icon={<Clock className="w-3 h-3" />}>
                    {job.experienceLevel}
                  </Badge>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                {/* Academic Criteria Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Badge variant="success" icon={<GraduationCap className="w-3 h-3" />}>
                    Min CGPA: {job.minCgpa}
                  </Badge>
                  <Badge variant="outline" icon={<Briefcase className="w-3 h-3" />}>
                    {job.department}
                  </Badge>
                  <Badge variant="primary">
                    {reqSkills.length} Required Skills
                  </Badge>
                </div>

                {/* Required Skills breakdown */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Graph Skill Dependencies</span>
                    <span className="text-slate-400 font-normal normal-case">
                      {mandatoryCount} Mandatory · {preferredCount} Preferred
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {reqSkills.map(rel => {
                      const sk = skills.find(s => s.id === rel.skillId);
                      if (!sk) return null;
                      const isMandatory = rel.importance === 'MANDATORY';
                      return (
                        <span
                          key={rel.skillId}
                          className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                            isMandatory
                              ? 'bg-blue-50/80 border-blue-200 text-blue-900 font-semibold'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          {sk.name}
                          <span className="text-[10px] ml-1 opacity-70">
                            ({rel.minProficiency[0]})
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Button Footer */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Target Student: <strong className="text-slate-800">{activeStudent.name}</strong>
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  icon={<ArrowRight className="w-3.5 h-3.5" />}
                  onClick={() => onSelectJobForMatch(job.id)}
                >
                  Analyze Skill Gap
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
