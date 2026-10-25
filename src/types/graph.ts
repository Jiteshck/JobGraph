export type SkillCategory = 
  | 'Languages'
  | 'Frontend'
  | 'Backend'
  | 'Database'
  | 'Cloud & DevOps'
  | 'Core CS & Tools';

export type ProficiencyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type RequirementImportance = 'MANDATORY' | 'PREFERRED';

export interface StudentNode {
  id: string;
  name: string;
  rollNo: string;
  degree: string;
  semester: number;
  cgpa: number;
  targetRole: string;
  email: string;
  avatarColor: string;
  experienceLevel?: string;
  preferredLocation?: string;
}

export interface SkillNode {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  marketDemand: 'Moderate' | 'High' | 'Very High';
  neo4jColor: string;
}

export interface JobNode {
  id: string;
  title: string;
  company: string;
  experienceLevel: 'Fresher' | 'Entry Level' | 'Associate' | 'Mid Level';
  department: string;
  description: string;
  minCgpa: number;
  location: string;
  salaryRange?: string;
  jobType?: string;
}

export interface CompanyNode {
  id: string;
  name: string;
  industry: string;
  location: string;
  website: string;
  openingsCount: number;
}

export interface StudentSkillRel {
  studentId: string;
  skillId: string;
  proficiency: ProficiencyLevel;
  verified: boolean;
  acquiredDate: string;
}

export interface JobSkillRel {
  jobId: string;
  skillId: string;
  importance: RequirementImportance;
  minProficiency: ProficiencyLevel;
}

export interface SkillSynergyRel {
  sourceSkillId: string;
  targetSkillId: string;
  weight: number; // 0 to 1 co-occurrence score
  reason: string;
}

export interface MatchedSkillDetail {
  skill: SkillNode;
  studentProficiency: ProficiencyLevel;
  requiredImportance: RequirementImportance;
  minProficiency: ProficiencyLevel;
  isSatisfied: boolean;
}

export interface MissingSkillDetail {
  skill: SkillNode;
  requiredImportance: RequirementImportance;
  minProficiency: ProficiencyLevel;
  priorityWeight: number;
}

export interface JobMatchCalculation {
  job: JobNode;
  matchPercentage: number; // (|Matched| / |Total Required|) * 100
  weightedScore: number;    // Weighted by Mandatory vs Preferred and proficiency
  totalRequiredCount: number;
  matchedCount: number;
  missingCount: number;
  matchedSkills: MatchedSkillDetail[];
  missingSkills: MissingSkillDetail[];
  cgpaEligible: boolean;
  graphTraversalDepth: number;
}

export interface BridgeSkillAnalysis {
  skill: SkillNode;
  potentialUnlockJobs: Array<{
    job: JobNode;
    currentMatch: number;
    projectedMatch: number;
    gain: number;
  }>;
  totalUnlockCount: number;
  averageBoostPercentage: number;
  coOccurringSkills: string[];
}

export interface CypherQueryTemplate {
  id: string;
  title: string;
  category: 'Matching' | 'Gap Analysis' | 'Recommendations' | 'Schema & Metrics';
  description: string;
  academicNotes: string;
  query: string;
  parameters: Record<string, any>;
  complexity: string; // e.g., "O(V + E) index-free adjacency"
}

export interface GraphVisualNode {
  id: string;
  label: string;
  type: 'Student' | 'Skill' | 'Job';
  category?: SkillCategory;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  radius: number;
  color: string;
  subtitle?: string;
}

export interface GraphVisualLink {
  source: string;
  target: string;
  label: string;
  type: 'HAS_SKILL' | 'REQUIRES_SKILL' | 'SYNERGY_WITH';
  importance?: RequirementImportance;
  proficiency?: ProficiencyLevel;
  activePath?: boolean;
}
