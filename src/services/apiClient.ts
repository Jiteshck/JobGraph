import {
  StudentNode,
  SkillNode,
  JobNode,
  CompanyNode,
  StudentSkillRel,
  JobSkillRel,
  JobMatchCalculation,
  BridgeSkillAnalysis,
  ProficiencyLevel,
  RequirementImportance
} from '../types/graph';
import {
  INITIAL_STUDENTS,
  ALL_SKILLS,
  ALL_JOBS,
  INITIAL_COMPANIES,
  INITIAL_STUDENT_SKILLS,
  INITIAL_JOB_SKILLS,
  SKILL_SYNERGIES,
  CYPHER_QUERIES
} from '../data/mockDatabase';

class GraphDatabaseService {
  private students: StudentNode[] = [...INITIAL_STUDENTS];
  private skills: SkillNode[] = [...ALL_SKILLS];
  private jobs: JobNode[] = [...ALL_JOBS];
  private companies: CompanyNode[] = [...INITIAL_COMPANIES];
  private studentSkills: StudentSkillRel[] = [...INITIAL_STUDENT_SKILLS];
  private jobSkills: JobSkillRel[] = [...INITIAL_JOB_SKILLS];

  // Presentation test state switches
  public simulatedLatencyMs: number = 0;
  public forceError: boolean = false;
  public forceEmptyData: boolean = false;

  private async delay(): Promise<void> {
    if (this.simulatedLatencyMs > 0) {
      await new Promise(resolve => setTimeout(resolve, this.simulatedLatencyMs));
    }
  }

  private checkError(): void {
    if (this.forceError) {
      throw new Error('Neo4j Driver Connection Timeout: Unable to acquire session from bolt://localhost:7687');
    }
  }

  private async api<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('jobgraph_access_token');
    const response = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init.headers || {}) } });
    let payload: any = {}; try { payload = await response.json(); } catch { /* empty response */ }
    if (!response.ok) { const detail = payload?.detail || payload?.error || `API request failed (${response.status})`; throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail)); }
    return payload as T;
  }

  // Fetch all students
  public async getStudents(): Promise<StudentNode[]> {
    const result = await this.api<{success: boolean; students: StudentNode[]}>('/api/admin/students');
    this.students = result.students || [];
    return [...this.students];
  }

  // Fetch student by id
  public async getStudent(id: string): Promise<StudentNode | null> {
    await this.delay();
    this.checkError();
    if (this.forceEmptyData) return null;
    return this.students.find(s => s.id === id) || null;
  }

  // Fetch all skills
  public async getSkills(): Promise<SkillNode[]> {
    const result = await this.api<{success: boolean; skills: SkillNode[]}>('/api/skills');
    this.skills = result.skills || []; return [...this.skills];
  }

  // Fetch all jobs
  public async getJobs(): Promise<JobNode[]> {
    const result = await this.api<{success: boolean; jobs: JobNode[]}>('/api/jobs');
    this.jobs = result.jobs || []; return [...this.jobs];
  }

  // Get skills possessed by student
  public async getStudentSkills(studentId: string): Promise<Array<{
    skill: SkillNode;
    proficiency: ProficiencyLevel;
    verified: boolean;
    acquiredDate: string;
  }>> {
    await this.delay();
    this.checkError();
    if (this.forceEmptyData) return [];

    const rels = this.studentSkills.filter(r => r.studentId === studentId);
    return rels
      .map(r => {
        const skill = this.skills.find(s => s.id === r.skillId);
        if (!skill) return null;
        return {
          skill,
          proficiency: r.proficiency,
          verified: r.verified,
          acquiredDate: r.acquiredDate
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }

  // Add or update a student skill
  public async setStudentSkill(
    studentId: string,
    skillId: string,
    proficiency: ProficiencyLevel
  ): Promise<void> {
    await this.delay();
    this.checkError();
    const existingIndex = this.studentSkills.findIndex(
      r => r.studentId === studentId && r.skillId === skillId
    );

    if (existingIndex >= 0) {
      this.studentSkills[existingIndex] = {
        ...this.studentSkills[existingIndex],
        proficiency
      };
    } else {
      this.studentSkills.push({
        studentId,
        skillId,
        proficiency,
        verified: true,
        acquiredDate: new Date().toISOString().split('T')[0]
      });
    }
  }

  // Remove skill from student
  public async removeStudentSkill(studentId: string, skillId: string): Promise<void> {
    await this.delay();
    this.checkError();
    this.studentSkills = this.studentSkills.filter(
      r => !(r.studentId === studentId && r.skillId === skillId)
    );
  }

  // Sync / bulk update student skills list
  public async syncStudentSkills(studentId: string, skillIds: string[]): Promise<void> {
    await this.delay();
    this.checkError();
    // Keep existing skills that are in skillIds
    this.studentSkills = this.studentSkills.filter(
      r => r.studentId !== studentId || skillIds.includes(r.skillId)
    );
    // Add any newly selected skillIds
    for (const skId of skillIds) {
      const exists = this.studentSkills.some(r => r.studentId === studentId && r.skillId === skId);
      if (!exists) {
        this.studentSkills.push({
          studentId,
          skillId: skId,
          proficiency: 'Intermediate',
          verified: true,
          acquiredDate: new Date().toISOString().split('T')[0]
        });
      }
    }
  }

  // Create a new student (for demo / viva)
  public async createStudent(student: Omit<StudentNode, 'id'>): Promise<StudentNode> {
    const result = await this.api<{success: boolean; student: StudentNode}>('/api/admin/students', { method: 'POST', body: JSON.stringify(student) });
    return result.student;
  }

  // CORE GRAPH ENGINE: Calculate matches between student and all jobs
  public async calculateMatchesForStudent(studentId: string): Promise<JobMatchCalculation[]> {
    await this.delay();
    this.checkError();
    if (this.forceEmptyData) return [];

    const student = this.students.find(s => s.id === studentId);
    if (!student) return [];

    const studentSkillRels = this.studentSkills.filter(r => r.studentId === studentId);
    const studentSkillMap = new Map<string, ProficiencyLevel>(
      studentSkillRels.map(r => [r.skillId, r.proficiency])
    );

    const results: JobMatchCalculation[] = [];

    for (const job of this.jobs) {
      const requiredRels = this.jobSkills.filter(r => r.jobId === job.id);
      const totalRequiredCount = requiredRels.length;

      const matchedSkills: JobMatchCalculation['matchedSkills'] = [];
      const missingSkills: JobMatchCalculation['missingSkills'] = [];

      let mandatoryCount = 0;
      let matchedMandatoryCount = 0;
      let weightedPoints = 0;
      let totalMaxPoints = 0;

      for (const rel of requiredRels) {
        const skill = this.skills.find(s => s.id === rel.skillId);
        if (!skill) continue;

        const isMandatory = rel.importance === 'MANDATORY';
        if (isMandatory) mandatoryCount++;

        const weightMultiplier = isMandatory ? 2.0 : 1.0;
        totalMaxPoints += weightMultiplier;

        const studentProficiency = studentSkillMap.get(rel.skillId);

        if (studentProficiency) {
          // Calculate proficiency satisfaction score
          const profLevelScore =
            studentProficiency === 'Advanced' ? 1.0 :
            studentProficiency === 'Intermediate' ? 0.85 : 0.6;

          weightedPoints += weightMultiplier * profLevelScore;

          matchedSkills.push({
            skill,
            studentProficiency,
            requiredImportance: rel.importance,
            minProficiency: rel.minProficiency,
            isSatisfied: true
          });

          if (isMandatory) matchedMandatoryCount++;
        } else {
          missingSkills.push({
            skill,
            requiredImportance: rel.importance,
            minProficiency: rel.minProficiency,
            priorityWeight: isMandatory ? 10 : 5
          });
        }
      }

      // Exact Graph Overlap Percentage: (Matched / Total Required) * 100
      // Uses single decimal precision when fractional (e.g. 66.7% for 4/6, 83.3% for 5/6, 80% for 4/5)
      const rawPercentage = totalRequiredCount > 0
        ? (matchedSkills.length / totalRequiredCount) * 100
        : 0;
      const matchPercentage = totalRequiredCount > 0
        ? Math.round(rawPercentage * 10) / 10
        : 0;

      // Weighted Score considering Mandatory requirements and proficiency level
      const weightedScore = totalMaxPoints > 0
        ? Math.round((weightedPoints / totalMaxPoints) * 100)
        : 0;

      results.push({
        job,
        matchPercentage,
        weightedScore,
        totalRequiredCount,
        matchedCount: matchedSkills.length,
        missingCount: missingSkills.length,
        matchedSkills,
        missingSkills: missingSkills.sort((a, b) => b.priorityWeight - a.priorityWeight),
        cgpaEligible: student.cgpa >= job.minCgpa,
        graphTraversalDepth: 2 // Student -> HAS_SKILL -> Skill <- REQUIRES_SKILL <- Job
      });
    }

    // Sort by Match Percentage descending, then Weighted Score
    return results.sort((a, b) => b.matchPercentage - a.matchPercentage || b.weightedScore - a.weightedScore);
  }

  // BRIDGE SKILL ANALYSIS: Identify skills that will produce the greatest unlock impact
  public async getBridgeSkillAnalysis(studentId: string): Promise<BridgeSkillAnalysis[]> {
    await this.delay();
    this.checkError();
    if (this.forceEmptyData) return [];

    const studentSkillRels = this.studentSkills.filter(r => r.studentId === studentId);
    const existingSkillIds = new Set(studentSkillRels.map(r => r.skillId));

    // Get current matches
    const currentMatches = await this.calculateMatchesForStudent(studentId);
    const currentMatchMap = new Map<string, number>(
      currentMatches.map(m => [m.job.id, m.matchPercentage])
    );

    // Identify candidate missing skills across all jobs
    const missingSkillCandidateIds = new Set<string>();
    for (const jobRel of this.jobSkills) {
      if (!existingSkillIds.has(jobRel.skillId)) {
        missingSkillCandidateIds.add(jobRel.skillId);
      }
    }

    const analyses: BridgeSkillAnalysis[] = [];

    for (const candidateId of missingSkillCandidateIds) {
      const skill = this.skills.find(s => s.id === candidateId);
      if (!skill) continue;

      const potentialUnlockJobs: BridgeSkillAnalysis['potentialUnlockJobs'] = [];
      let totalGain = 0;

      for (const m of currentMatches) {
        const job = m.job;
        const requiredRels = this.jobSkills.filter(r => r.jobId === job.id);
        const requiresCandidate = requiredRels.some(r => r.skillId === candidateId);

        if (requiresCandidate) {
          const currentMatch = currentMatchMap.get(job.id) || 0;
          const newMatchedCount = m.matchedCount + 1;
          const projectedMatch = Math.round(((newMatchedCount / m.totalRequiredCount) * 100) * 10) / 10;
          const gain = Math.round((projectedMatch - currentMatch) * 10) / 10;

          potentialUnlockJobs.push({
            job,
            currentMatch,
            projectedMatch,
            gain
          });

          totalGain += gain;
        }
      }

      // Check co-occurring synergies
      const synergies = SKILL_SYNERGIES
        .filter(sy => sy.sourceSkillId === candidateId || sy.targetSkillId === candidateId)
        .map(sy => {
          const otherId = sy.sourceSkillId === candidateId ? sy.targetSkillId : sy.sourceSkillId;
          const otherSkill = this.skills.find(s => s.id === otherId);
          return otherSkill ? otherSkill.name : '';
        })
        .filter(Boolean);

      const unlockCount = potentialUnlockJobs.length;
      const averageBoostPercentage = unlockCount > 0 ? Math.round((totalGain / unlockCount) * 10) / 10 : 0;

      if (unlockCount > 0) {
        analyses.push({
          skill,
          potentialUnlockJobs: potentialUnlockJobs.sort((a, b) => b.gain - a.gain),
          totalUnlockCount: unlockCount,
          averageBoostPercentage,
          coOccurringSkills: synergies
        });
      }
    }

    // Rank bridge skills by number of jobs unlocked, then average boost
    return analyses.sort((a, b) => b.totalUnlockCount - a.totalUnlockCount || b.averageBoostPercentage - a.averageBoostPercentage);
  }

  // SUBGRAPH GENERATOR for Visual Graph Component
  public async getSubgraph(studentId: string, selectedJobId?: string) {
    await this.delay();
    this.checkError();

    const student = this.students.find(s => s.id === studentId);
    if (!student) return { nodes: [], links: [] };

    const studentSkills = this.studentSkills.filter(r => r.studentId === studentId);
    const studentSkillIds = new Set(studentSkills.map(s => s.skillId));

    // Choose relevant jobs (selected job + top jobs)
    const matches = await this.calculateMatchesForStudent(studentId);
    const relevantJobs = selectedJobId
      ? this.jobs.filter(j => j.id === selectedJobId)
      : matches.slice(0, 4).map(m => m.job);

    const relevantJobIds = new Set(relevantJobs.map(j => j.id));

    // Find all skills connected to either this student or the relevant jobs
    const relevantJobSkills = this.jobSkills.filter(r => relevantJobIds.has(r.jobId));
    const allRelevantSkillIds = new Set([
      ...studentSkillIds,
      ...relevantJobSkills.map(r => r.skillId)
    ]);

    // Build visual nodes
    const nodes: any[] = [];
    nodes.push({
      id: student.id,
      label: student.name,
      type: 'Student',
      radius: 28,
      color: student.avatarColor,
      subtitle: `${student.rollNo} · CGPA ${student.cgpa}`
    });

    for (const job of relevantJobs) {
      nodes.push({
        id: job.id,
        label: job.title,
        type: 'Job',
        radius: 24,
        color: '#475569', // slate-600
        subtitle: `${job.company} · Min CGPA ${job.minCgpa}`
      });
    }

    for (const skillId of allRelevantSkillIds) {
      const skill = this.skills.find(s => s.id === skillId);
      if (!skill) continue;

      const isPossessed = studentSkillIds.has(skill.id);
      nodes.push({
        id: skill.id,
        label: skill.name,
        type: 'Skill',
        category: skill.category,
        radius: 18,
        color: skill.neo4jColor,
        subtitle: `${skill.category} · ${isPossessed ? 'Acquired' : 'Missing'}`
      });
    }

    // Build visual links
    const links: any[] = [];

    // Student -> Skill [:HAS_SKILL]
    for (const ss of studentSkills) {
      if (allRelevantSkillIds.has(ss.skillId)) {
        links.push({
          source: student.id,
          target: ss.skillId,
          label: 'HAS_SKILL',
          type: 'HAS_SKILL',
          proficiency: ss.proficiency,
          activePath: true
        });
      }
    }

    // Job -> Skill [:REQUIRES_SKILL]
    for (const js of relevantJobSkills) {
      const isMatched = studentSkillIds.has(js.skillId);
      links.push({
        source: js.jobId,
        target: js.skillId,
        label: 'REQUIRES_SKILL',
        type: 'REQUIRES_SKILL',
        importance: js.importance,
        proficiency: js.minProficiency,
        activePath: isMatched
      });
    }

    return { nodes, links };
  }

  // Execute Cypher Query (Academic Simulation)
  public async executeCypher(queryId: string, params: Record<string, any>) {
    await this.delay();
    this.checkError();

    const template = CYPHER_QUERIES.find(q => q.id === queryId);
    if (!template) {
      throw new Error(`Query template ${queryId} not found`);
    }

    const studentId = params.studentId || 'student-1';
    const student = this.students.find(s => s.id === studentId);

    if (queryId === 'query-1') {
      const matches = await this.calculateMatchesForStudent(studentId);
      return {
        columns: ['jobTitle', 'company', 'matchedSkillCount', 'totalRequiredCount', 'matchPercentage', 'matchedSkills', 'missingSkills'],
        rows: matches.map(m => ({
          jobTitle: m.job.title,
          company: m.job.company,
          matchedSkillCount: m.matchedCount,
          totalRequiredCount: m.totalRequiredCount,
          matchPercentage: `${m.matchPercentage}%`,
          matchedSkills: m.matchedSkills.map(ms => ms.skill.name).join(', '),
          missingSkills: m.missingSkills.map(ms => ms.skill.name).join(', ')
        })),
        executionTimeMs: 14.2,
        recordsReturned: matches.length,
        nodesTraversed: 1 + this.studentSkills.filter(r => r.studentId === studentId).length + this.jobs.length
      };
    }

    if (queryId === 'query-2') {
      const jobId = params.jobId || 'job-1';
      const matches = await this.calculateMatchesForStudent(studentId);
      const match = matches.find(m => m.job.id === jobId);
      const missing = match ? match.missingSkills : [];
      return {
        columns: ['missingSkill', 'category', 'importance', 'minRequiredProficiency'],
        rows: missing.map(ms => ({
          missingSkill: ms.skill.name,
          category: ms.skill.category,
          importance: ms.requiredImportance,
          minRequiredProficiency: ms.minProficiency
        })),
        executionTimeMs: 4.8,
        recordsReturned: missing.length,
        nodesTraversed: 1 + missing.length
      };
    }

    if (queryId === 'query-3') {
      const bridges = await this.getBridgeSkillAnalysis(studentId);
      return {
        columns: ['bridgeSkill', 'category', 'unlockJobCount', 'targetJobs'],
        rows: bridges.slice(0, 5).map(b => ({
          bridgeSkill: b.skill.name,
          category: b.skill.category,
          unlockJobCount: b.totalUnlockCount,
          targetJobs: b.potentialUnlockJobs.map(p => p.job.title).join(' | ')
        })),
        executionTimeMs: 18.5,
        recordsReturned: Math.min(5, bridges.length),
        nodesTraversed: this.skills.length + this.jobs.length
      };
    }

    if (queryId === 'query-4') {
      return {
        columns: ['totalStudents', 'totalSkills', 'totalJobs', 'studentSkillEdges', 'jobSkillEdges'],
        rows: [{
          totalStudents: this.students.length,
          totalSkills: this.skills.length,
          totalJobs: this.jobs.length,
          studentSkillEdges: this.studentSkills.length,
          jobSkillEdges: this.jobSkills.length
        }],
        executionTimeMs: 1.2,
        recordsReturned: 1,
        nodesTraversed: 0 // O(1) header counts
      };
    }

    return {
      columns: ['status', 'message'],
      rows: [{ status: 'OK', message: 'Executed' }],
      executionTimeMs: 5.0,
      recordsReturned: 1,
      nodesTraversed: 10
    };
  }

  // Reset database to initial state
  public resetToDefault(): void {
    this.students = [...INITIAL_STUDENTS];
    this.skills = [...ALL_SKILLS];
    this.jobs = [...ALL_JOBS];
    this.companies = [...INITIAL_COMPANIES];
    this.studentSkills = [...INITIAL_STUDENT_SKILLS];
    this.jobSkills = [...INITIAL_JOB_SKILLS];
    this.forceError = false;
    this.forceEmptyData = false;
  }

  // --- ADMIN MANAGEMENT METHODS ---

  // Companies
  public async getCompanies(): Promise<CompanyNode[]> {
    const result = await this.api<{success: boolean; companies: CompanyNode[]}>('/api/companies');
    this.companies = result.companies || []; return [...this.companies];
  }
  public async createCompany(company: Omit<CompanyNode, 'id' | 'openingsCount'>): Promise<CompanyNode> {
    const result = await this.api<{success: boolean; company: CompanyNode}>('/api/admin/companies', { method: 'POST', body: JSON.stringify(company) }); return result.company;
  }
  public async updateCompany(id: string, updates: Partial<CompanyNode>): Promise<void> {
    const existing = (await this.getCompanies()).find(c => c.id === id); if (!existing) throw new Error('Company not found.');
    await this.api(`/api/admin/companies/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify({ ...existing, ...updates }) });
  }
  public async deleteCompany(id: string): Promise<void> { await this.api(`/api/admin/companies/${encodeURIComponent(id)}`, { method: 'DELETE' }); }


  // Student update & delete
  public async updateStudent(id: string, updates: Partial<StudentNode>): Promise<void> {
    await this.api(`/api/admin/students/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(updates) });
  }

  public async deleteStudent(id: string): Promise<void> {
    await this.api(`/api/admin/students/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }

  // Job create, update & delete
  public async createJob(job: Omit<JobNode, 'id'>, requiredSkills: Array<{ skillId: string; importance: RequirementImportance; minProficiency: ProficiencyLevel }>): Promise<JobNode> {
    const result = await this.api<{success: boolean; job: JobNode}>('/api/admin/jobs', { method: 'POST', body: JSON.stringify({ ...job, requiredSkills }) }); return result.job;
  }
  public async updateJob(id: string, updates: Partial<JobNode>): Promise<void> {
    const existing = (await this.getJobs()).find(j => j.id === id); if (!existing) throw new Error('Job not found.');
    await this.api(`/api/admin/jobs/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify({ ...existing, ...updates }) });
  }


  public async getJobSkills(jobId: string): Promise<SkillNode[]> {
    const result = await this.api<{success: boolean; job: JobNode; requiredSkills: Array<{skill: SkillNode}>}>(`/api/jobs/${encodeURIComponent(jobId)}`);
    return (result.requiredSkills || []).map(item => item.skill);
  }
  public async getAllJobSkillsMap(): Promise<Record<string, SkillNode[]>> {
    const result = await this.api<{success: boolean; items: Record<string, SkillNode[]>}>('/api/admin/job-skills-map'); return result.items || {};
  }
  public async getAllStudentSkillsMap(): Promise<Record<string, SkillNode[]>> {
    const result = await this.api<{success: boolean; items: Record<string, SkillNode[]>}>('/api/admin/student-skills-map'); return result.items || {};
  }
  public async updateJobWithSkills(id: string, updates: Partial<JobNode>, skillIds?: string[]): Promise<void> {
    const existing = (await this.getJobs()).find(j => j.id === id); if (!existing) throw new Error('Job not found.');
    const requiredSkills = skillIds?.map(skillId => ({ skillId, importance: 'MANDATORY' as RequirementImportance, minProficiency: 'Intermediate' as ProficiencyLevel }));
    await this.api(`/api/admin/jobs/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify({ ...existing, ...updates, ...(requiredSkills ? { requiredSkills } : {}) }) });
  }



  public async updateStudentWithSkills(id: string, updates: Partial<StudentNode>, skillIds?: string[]): Promise<void> {
    await this.api(`/api/admin/students/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify({ ...updates, ...(skillIds ? { selectedSkills: skillIds } : {}) }) });
  }

  public async deleteJob(id: string): Promise<void> { await this.api(`/api/admin/jobs/${encodeURIComponent(id)}`, { method: 'DELETE' }); }


  // Skill create, update & delete
  public async createSkill(skill: Omit<SkillNode, 'id'>): Promise<SkillNode> {
    const result = await this.api<{success: boolean; skill: SkillNode}>('/api/admin/skills', { method: 'POST', body: JSON.stringify(skill) }); return result.skill;
  }
  public async updateSkill(id: string, updates: Partial<SkillNode>): Promise<void> {
    const existing = (await this.getSkills()).find(sk => sk.id === id); if (!existing) throw new Error('Skill not found.');
    await this.api(`/api/admin/skills/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify({ ...existing, ...updates }) });
  }
  public async deleteSkill(id: string): Promise<void> { await this.api(`/api/admin/skills/${encodeURIComponent(id)}`, { method: 'DELETE' }); }


  // Admin Overview Analytics
  public async getAdminOverviewStats() {
    const result = await this.api<{success: boolean; stats: {
      totalStudents: number; totalJobs: number; totalCompanies: number; totalSkills: number;
      totalStudentSkillEdges: number; totalJobSkillEdges: number; avgTopMatchPercentage: number;
      topDemandedSkills: Array<{skill: SkillNode; count: number}>;
    }}>('/api/admin/stats');
    return result.stats;
  }
}

export const graphDb = new GraphDatabaseService();
