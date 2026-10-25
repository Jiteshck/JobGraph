import React, { useState, useEffect } from 'react';
import { useRouter } from '../router/RouterContext';
import {
  StudentNode,
  JobNode,
  CompanyNode,
  SkillNode,
  SkillCategory,
  ProficiencyLevel,
  RequirementImportance
} from '../types/graph';
import { graphDb } from '../services/apiClient';
import {
  Users,
  Briefcase,
  Building,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Network,
  ArrowRight,
  X,
  Search,
  ExternalLink,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { Button, Card, Badge, SkillChip } from '../components/design-system/DesignTokens';

export const AdminManagePage: React.FC = () => {
  const { search, navigate } = useRouter();

  // Active Tab handling
  const getInitialTab = (): 'students' | 'jobs' | 'companies' | 'skills' => {
    const params = new URLSearchParams(search || window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'jobs' || tabParam === 'companies' || tabParam === 'skills' || tabParam === 'students') {
      return tabParam;
    }
    return 'students';
  };

  const [activeTab, setActiveTab] = useState<'students' | 'jobs' | 'companies' | 'skills'>(getInitialTab);

  useEffect(() => {
    const params = new URLSearchParams(search || window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'jobs' || tabParam === 'companies' || tabParam === 'skills' || tabParam === 'students') {
      setActiveTab(tabParam);
    }
  }, [search]);

  // Data states
  const [students, setStudents] = useState<StudentNode[]>([]);
  const [jobs, setJobs] = useState<JobNode[]>([]);
  const [companies, setCompanies] = useState<CompanyNode[]>([]);
  const [skills, setSkills] = useState<SkillNode[]>([]);
  const [studentSkillsMap, setStudentSkillsMap] = useState<Record<string, SkillNode[]>>({});
  const [jobSkillsMap, setJobSkillsMap] = useState<Record<string, SkillNode[]>>({});

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals state: Add or Edit
  const [activeModal, setActiveModal] = useState<
    | null
    | { type: 'student'; mode: 'add' | 'edit'; data?: StudentNode }
    | { type: 'job'; mode: 'add' | 'edit'; data?: JobNode }
    | { type: 'company'; mode: 'add' | 'edit'; data?: CompanyNode }
    | { type: 'skill'; mode: 'add' | 'edit'; data?: SkillNode }
  >(null);

  // Delete Confirmation Modal state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'student' | 'job' | 'company' | 'skill';
    id: string;
    name: string;
    relationshipsDescription: string;
  } | null>(null);

  // Form states
  // Student Form
  const [studentFormData, setStudentFormData] = useState({
    id: '',
    name: '',
    email: '',
    degree: 'BCA',
    experienceLevel: 'Fresher',
    preferredLocation: 'Pune',
    selectedSkills: [] as string[]
  });

  // Job Form
  const [jobFormData, setJobFormData] = useState({
    id: '',
    title: '',
    company: '',
    location: 'Pune',
    salaryMin: 4,
    salaryMax: 8,
    experienceLevel: 'Fresher' as 'Entry Level' | 'Associate' | 'Mid Level' | 'Fresher',
    jobType: 'Full Time',
    selectedSkills: [] as string[]
  });

  // Company Form
  const [companyFormData, setCompanyFormData] = useState({
    id: '',
    name: '',
    industry: 'Information Technology'
  });

  // Skill Form
  const [skillFormData, setSkillFormData] = useState({
    id: '',
    name: '',
    category: 'Backend' as SkillCategory
  });

  // Skill search helper inside modals
  const [skillSearchQuery, setSkillSearchQuery] = useState<string>('');

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotice({ type, message });
    setTimeout(() => {
      setNotice(null);
    }, 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [s, j, c, sk, sSkillsMap, jSkillsMap] = await Promise.all([
        graphDb.getStudents(),
        graphDb.getJobs(),
        graphDb.getCompanies(),
        graphDb.getSkills(),
        graphDb.getAllStudentSkillsMap(),
        graphDb.getAllJobSkillsMap()
      ]);
      setStudents(s);
      setJobs(j);
      setCompanies(c);
      setSkills(sk);
      setStudentSkillsMap(sSkillsMap);
      setJobSkillsMap(jSkillsMap);
    } catch (err) {
      console.error('Error loading graph management data:', err);
      showNotification('Unable to load graph data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ESC key closes modals where appropriate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (deleteConfirmation) {
          setDeleteConfirmation(null);
        } else if (activeModal) {
          setActiveModal(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, deleteConfirmation]);

  // Open Add Modals
  const handleOpenAddStudent = () => {
    setStudentFormData({
      id: `std_${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      email: '',
      degree: 'BCA',
      experienceLevel: 'Fresher',
      preferredLocation: 'Pune',
      selectedSkills: ['sk-1', 'sk-2', 'sk-4'] // Java, Python, SQL sample
    });
    setSkillSearchQuery('');
    setActiveModal({ type: 'student', mode: 'add' });
  };

  const handleOpenEditStudent = (student: StudentNode) => {
    const existingSkills = studentSkillsMap[student.id] || [];
    setStudentFormData({
      id: student.id,
      name: student.name,
      email: student.email || `${student.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
      degree: student.degree || 'BCA',
      experienceLevel: student.experienceLevel || 'Fresher',
      preferredLocation: student.preferredLocation || 'Pune',
      selectedSkills: existingSkills.map(sk => sk.id)
    });
    setSkillSearchQuery('');
    setActiveModal({ type: 'student', mode: 'edit', data: student });
  };

  const handleOpenAddJob = () => {
    setJobFormData({
      id: `job_${Math.floor(1000 + Math.random() * 9000)}`,
      title: '',
      company: companies[0]?.name || 'ABC Technologies',
      location: 'Pune',
      salaryMin: 4,
      salaryMax: 8,
      experienceLevel: 'Fresher',
      jobType: 'Full Time',
      selectedSkills: ['sk-1', 'sk-2', 'sk-4'] // Java, Python, SQL
    });
    setSkillSearchQuery('');
    setActiveModal({ type: 'job', mode: 'add' });
  };

  const handleOpenEditJob = (job: JobNode) => {
    const existingSkills = jobSkillsMap[job.id] || [];
    let sMin = 4;
    let sMax = 8;
    if (job.salaryRange) {
      const match = job.salaryRange.match(/(\d+)\D+(\d+)/);
      if (match) {
        sMin = parseInt(match[1]) || 4;
        sMax = parseInt(match[2]) || 8;
      }
    }

    setJobFormData({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      salaryMin: sMin,
      salaryMax: sMax,
      experienceLevel: (job.experienceLevel as any) || 'Fresher',
      jobType: job.jobType || 'Full Time',
      selectedSkills: existingSkills.map(s => s.id)
    });
    setSkillSearchQuery('');
    setActiveModal({ type: 'job', mode: 'edit', data: job });
  };

  const handleOpenAddCompany = () => {
    setCompanyFormData({
      id: `comp_${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      industry: 'Information Technology'
    });
    setActiveModal({ type: 'company', mode: 'add' });
  };

  const handleOpenEditCompany = (company: CompanyNode) => {
    setCompanyFormData({
      id: company.id,
      name: company.name,
      industry: company.industry
    });
    setActiveModal({ type: 'company', mode: 'edit', data: company });
  };

  const handleOpenAddSkill = () => {
    setSkillFormData({
      id: `sk_${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      category: 'Backend'
    });
    setActiveModal({ type: 'skill', mode: 'add' });
  };

  const handleOpenEditSkill = (skill: SkillNode) => {
    setSkillFormData({
      id: skill.id,
      name: skill.name,
      category: skill.category
    });
    setActiveModal({ type: 'skill', mode: 'edit', data: skill });
  };

  // Submit Student Form
  const handleSubmitStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (!activeModal || activeModal.type !== 'student') return;

      if (activeModal.mode === 'add') {
        const newStudent = await graphDb.createStudent({
          name: studentFormData.name,
          rollNo: studentFormData.id,
          degree: studentFormData.degree,
          semester: 6,
          cgpa: 8.0,
          targetRole: `${studentFormData.degree} Graduate`,
          email: studentFormData.email,
          avatarColor: '#2563EB',
          experienceLevel: studentFormData.experienceLevel,
          preferredLocation: studentFormData.preferredLocation
        });
        await graphDb.syncStudentSkills(newStudent.id, studentFormData.selectedSkills);
        showNotification('Student created successfully.');
      } else {
        await graphDb.updateStudentWithSkills(
          studentFormData.id,
          {
            name: studentFormData.name,
            email: studentFormData.email,
            degree: studentFormData.degree,
            experienceLevel: studentFormData.experienceLevel,
            preferredLocation: studentFormData.preferredLocation
          },
          studentFormData.selectedSkills
        );
        showNotification('Student updated successfully.');
      }

      setActiveModal(null);
      await loadData();
    } catch (err) {
      console.error(err);
      showNotification('Unable to save changes.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Job Form
  const handleSubmitJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (!activeModal || activeModal.type !== 'job') return;

      const salaryRangeStr = `₹${jobFormData.salaryMin}–${jobFormData.salaryMax} LPA`;
      const expLevelMapped: 'Entry Level' | 'Associate' | 'Mid Level' =
        jobFormData.experienceLevel === 'Fresher' || jobFormData.experienceLevel === 'Entry Level'
          ? 'Entry Level'
          : jobFormData.experienceLevel === 'Associate'
          ? 'Associate'
          : 'Mid Level';

      if (activeModal.mode === 'add') {
        const requiredSkillPayload = jobFormData.selectedSkills.map(skId => ({
          skillId: skId,
          importance: 'MANDATORY' as RequirementImportance,
          minProficiency: 'Intermediate' as ProficiencyLevel
        }));

        await graphDb.createJob(
          {
            title: jobFormData.title,
            company: jobFormData.company,
            experienceLevel: expLevelMapped,
            department: 'Engineering',
            description: `We are seeking a motivated ${jobFormData.title} to join ${jobFormData.company} in ${jobFormData.location}. You will work on robust software platforms, write high-quality code, collaborate with cross-functional teams, and build scalable features.`,
            minCgpa: 6.5,
            location: jobFormData.location,
            salaryRange: salaryRangeStr,
            jobType: jobFormData.jobType
          },
          requiredSkillPayload
        );
        showNotification('Job created successfully.');
      } else {
        await graphDb.updateJobWithSkills(
          jobFormData.id,
          {
            title: jobFormData.title,
            company: jobFormData.company,
            location: jobFormData.location,
            salaryRange: salaryRangeStr,
            experienceLevel: expLevelMapped,
            jobType: jobFormData.jobType
          },
          jobFormData.selectedSkills
        );
        showNotification('Job updated successfully.');
      }

      setActiveModal(null);
      await loadData();
    } catch (err) {
      console.error(err);
      showNotification('Unable to save changes.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Company Form
  const handleSubmitCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (!activeModal || activeModal.type !== 'company') return;

      if (activeModal.mode === 'add') {
        await graphDb.createCompany({
          name: companyFormData.name,
          industry: companyFormData.industry,
          location: 'Pune, India',
          website: 'https://example.com'
        });
        showNotification('Company created successfully.');
      } else {
        await graphDb.updateCompany(companyFormData.id, {
          name: companyFormData.name,
          industry: companyFormData.industry
        });
        showNotification('Company updated successfully.');
      }

      setActiveModal(null);
      await loadData();
    } catch (err) {
      console.error(err);
      showNotification('Unable to save changes.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Skill Form
  const handleSubmitSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (!activeModal || activeModal.type !== 'skill') return;

      if (activeModal.mode === 'add') {
        await graphDb.createSkill({
          name: skillFormData.name,
          category: skillFormData.category,
          description: `${skillFormData.name} programming competency and tooling.`,
          marketDemand: 'High',
          neo4jColor: '#2563EB'
        });
        showNotification('Skill created successfully.');
      } else {
        await graphDb.updateSkill(skillFormData.id, {
          name: skillFormData.name,
          category: skillFormData.category
        });
        showNotification('Skill updated successfully.');
      }

      setActiveModal(null);
      await loadData();
    } catch (err) {
      console.error(err);
      showNotification('Unable to save changes.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Perform Confirmed Deletion
  const handleConfirmDelete = async () => {
    if (!deleteConfirmation) return;
    setSubmitting(true);
    try {
      const { type, id, name } = deleteConfirmation;
      if (type === 'student') {
        await graphDb.deleteStudent(id);
        showNotification(`Student "${name}" and all (:HAS_SKILL) relationships deleted successfully.`);
      } else if (type === 'job') {
        await graphDb.deleteJob(id);
        showNotification(`Job "${name}" and all (:REQUIRES_SKILL) relationships deleted successfully.`);
      } else if (type === 'company') {
        await graphDb.deleteCompany(id);
        showNotification(`Company "${name}" removed from graph.`);
      } else if (type === 'skill') {
        await graphDb.deleteSkill(id);
        showNotification(`Skill "${name}" removed from ontology and all linked edges.`);
      }

      setDeleteConfirmation(null);
      await loadData();
    } catch (err) {
      console.error(err);
      showNotification('Unable to save changes.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSkillsForModal = skills.filter(s =>
    s.name.toLowerCase().includes(skillSearchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(skillSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-page-entrance">
      {/* Toast Notification */}
      {notice && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between border shadow-sm transition-all ${
            notice.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
          role="alert"
        >
          <div className="flex items-center gap-2.5">
            {notice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notice.message}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer ml-3"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <Card className="p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <Network className="w-3.5 h-3.5" />
                Neo4j Graph Database
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Manage Graph Data
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage students, jobs, companies and skills stored in Neo4j.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeTab !== 'students' && <Button
              variant="primary"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                if (activeTab === 'students') handleOpenAddStudent();
                else if (activeTab === 'jobs') handleOpenAddJob();
                else if (activeTab === 'companies') handleOpenAddCompany();
                else if (activeTab === 'skills') handleOpenAddSkill();
              }}
              title={`Add new ${activeTab.slice(0, -1)}`}
            >
              + Add
            </Button>}
          </div>
        </div>

        {/* 4 Tabs with exact names */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 border-t border-slate-100 text-xs">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2.5 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 border ${
              activeTab === 'students'
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Students ({students.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2.5 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 border ${
              activeTab === 'jobs'
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Jobs ({jobs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('companies')}
            className={`px-4 py-2.5 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 border ${
              activeTab === 'companies'
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Companies ({companies.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('skills')}
            className={`px-4 py-2.5 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 border ${
              activeTab === 'skills'
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Skills ({skills.length})</span>
          </button>
        </div>
      </Card>

      {/* Loading Skeleton */}
      {loading ? (
        <Card className="p-8 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-medium">Loading Neo4j graph records...</p>
        </Card>
      ) : (
        <>
          {/* TAB 1: STUDENTS */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              {/* Desktop and Tablet: Table */}
              <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                    <tr>
                      <th className="p-2.5 lg:p-3.5">Student ID</th>
                      <th className="p-2.5 lg:p-3.5">Name</th>
                      <th className="p-2.5 lg:p-3.5">Education</th>
                      <th className="p-2.5 lg:p-3.5">Experience</th>
                      <th className="p-2.5 lg:p-3.5">Location</th>
                      <th className="p-2.5 lg:p-3.5">
                        <span>Skills</span>
                        <span className="text-[10px] text-blue-600 font-mono font-normal ml-1 hidden lg:inline">(:HAS_SKILL)</span>
                      </th>
                      <th className="p-2.5 lg:p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map(student => {
                      const stSkills = studentSkillsMap[student.id] || [];
                      return (
                        <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-2.5 lg:p-3.5 font-mono text-slate-500 font-medium">{student.id}</td>
                          <td className="p-2.5 lg:p-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                              style={{ backgroundColor: student.avatarColor || '#2563EB' }}
                            >
                              {student.name[0]}
                            </div>
                            <div>
                              <div>{student.name}</div>
                              <div className="text-[11px] font-normal text-slate-400">{student.email}</div>
                            </div>
                          </td>
                          <td className="p-2.5 lg:p-3.5 text-slate-700 font-medium">{student.degree || 'BCA'}</td>
                          <td className="p-2.5 lg:p-3.5">
                            <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 font-medium">
                              {student.experienceLevel || 'Fresher'}
                            </span>
                          </td>
                          <td className="p-2.5 lg:p-3.5 text-slate-600">{student.preferredLocation || 'Pune'}</td>
                          <td className="p-2.5 lg:p-3.5 max-w-xs">
                            <div className="flex flex-wrap gap-1">
                              {stSkills.slice(0, 4).map(s => (
                                <span
                                  key={s.id}
                                  className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200"
                                >
                                  {s.name}
                                </span>
                              ))}
                              {stSkills.length > 4 && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-500 font-medium bg-slate-100">
                                  +{stSkills.length - 4} more
                                </span>
                              )}
                              {stSkills.length === 0 && (
                                <span className="text-[11px] text-slate-400 italic">No skills linked</span>
                              )}
                            </div>
                          </td>
                          <td className="p-2.5 lg:p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditStudent(student)}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit Student"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirmation({
                                    type: 'student',
                                    id: student.id,
                                    name: student.name,
                                    relationshipsDescription: `All (${stSkills.length}) :HAS_SKILL relationships pointing to technical skill nodes will be permanently severed.`
                                  })
                                }
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Student"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile: Cards */}
              <div className="md:hidden space-y-3">
                {students.map(student => {
                  const stSkills = studentSkillsMap[student.id] || [];
                  return (
                    <Card key={student.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ backgroundColor: student.avatarColor || '#2563EB' }}
                          >
                            {student.name[0]}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{student.name}</div>
                            <div className="text-[11px] font-mono text-slate-400">ID: {student.id}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditStudent(student)}
                            className="p-2 min-w-[38px] min-h-[38px] flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            aria-label="Edit Student"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirmation({
                                type: 'student',
                                id: student.id,
                                name: student.name,
                                relationshipsDescription: `All (${stSkills.length}) :HAS_SKILL relationships pointing to technical skill nodes will be permanently severed.`
                              })
                            }
                            className="p-2 min-w-[38px] min-h-[38px] flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            aria-label="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs border-y border-slate-100 py-2">
                        <div>
                          <div className="text-slate-400 text-[10px] uppercase font-semibold">Education</div>
                          <div className="font-medium text-slate-700">{student.degree || 'BCA'}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-[10px] uppercase font-semibold">Experience</div>
                          <div className="font-medium text-slate-700">{student.experienceLevel || 'Fresher'}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-[10px] uppercase font-semibold">Location</div>
                          <div className="font-medium text-slate-700">{student.preferredLocation || 'Pune'}</div>
                        </div>
                      </div>

                      <div>
                        <div className="text-slate-400 text-[10px] uppercase font-semibold mb-1">
                          Skills ({stSkills.length})
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {stSkills.map(s => (
                            <span
                              key={s.id}
                              className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200"
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: JOBS */}
          {activeTab === 'jobs' && (
            <div className="space-y-4">
              {/* Desktop and Tablet: Table */}
              <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                    <tr>
                      <th className="p-2.5 lg:p-3.5">Job ID</th>
                      <th className="p-2.5 lg:p-3.5">Job Title</th>
                      <th className="p-2.5 lg:p-3.5">
                        <span>Company</span>
                        <span className="text-[10px] text-indigo-600 font-mono font-normal ml-1 hidden lg:inline">(:POSTED_BY)</span>
                      </th>
                      <th className="p-2.5 lg:p-3.5">Location</th>
                      <th className="p-2.5 lg:p-3.5">Job Type</th>
                      <th className="p-2.5 lg:p-3.5">
                        <span>Required Skills</span>
                        <span className="text-[10px] text-indigo-600 font-mono font-normal ml-1 hidden lg:inline">(:REQUIRES_SKILL)</span>
                      </th>
                      <th className="p-2.5 lg:p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {jobs.map(job => {
                      const jSkills = jobSkillsMap[job.id] || [];
                      return (
                        <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-2.5 lg:p-3.5 font-mono text-slate-500 font-medium">{job.id}</td>
                          <td className="p-2.5 lg:p-3.5">
                            <div className="font-bold text-slate-900">{job.title}</div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {job.salaryRange || '₹4–8 LPA'} • {job.experienceLevel}
                            </div>
                          </td>
                          <td className="p-2.5 lg:p-3.5 font-medium text-slate-700 flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-slate-400" />
                            <span>{job.company}</span>
                          </td>
                          <td className="p-2.5 lg:p-3.5 text-slate-600">{job.location}</td>
                          <td className="p-2.5 lg:p-3.5">
                            <Badge variant="default" size="sm">
                              {job.jobType || 'Full Time'}
                            </Badge>
                          </td>
                          <td className="p-2.5 lg:p-3.5 max-w-xs">
                            <div className="flex flex-wrap gap-1">
                              {jSkills.slice(0, 4).map(s => (
                                <span
                                  key={s.id}
                                  className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
                                >
                                  {s.name}
                                </span>
                              ))}
                              {jSkills.length > 4 && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-500 font-medium bg-slate-100">
                                  +{jSkills.length - 4} more
                                </span>
                              )}
                              {jSkills.length === 0 && (
                                <span className="text-[11px] text-slate-400 italic">No skills required</span>
                              )}
                            </div>
                          </td>
                          <td className="p-2.5 lg:p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditJob(job)}
                                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit Job"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteConfirmation({
                                    type: 'job',
                                    id: job.id,
                                    name: job.title,
                                    relationshipsDescription: `The (:POSTED_BY) relationship to ${job.company} and all (${jSkills.length}) (:REQUIRES_SKILL) relationships will be removed.`
                                  })
                                }
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete Job"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile: Cards */}
              <div className="md:hidden space-y-3">
                {jobs.map(job => {
                  const jSkills = jobSkillsMap[job.id] || [];
                  return (
                    <Card key={job.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{job.title}</div>
                          <div className="text-xs text-slate-600 font-medium">{job.company}</div>
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">ID: {job.id}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditJob(job)}
                            className="p-2 min-w-[38px] min-h-[38px] flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            aria-label="Edit Job"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirmation({
                                type: 'job',
                                id: job.id,
                                name: job.title,
                                relationshipsDescription: `The (:POSTED_BY) relationship to ${job.company} and all (${jSkills.length}) (:REQUIRES_SKILL) relationships will be removed.`
                              })
                            }
                            className="p-2 min-w-[38px] min-h-[38px] flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            aria-label="Delete Job"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs border-y border-slate-100 py-2">
                        <div>
                          <div className="text-slate-400 text-[10px] uppercase font-semibold">Location</div>
                          <div className="font-medium text-slate-700">{job.location}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-[10px] uppercase font-semibold">Job Type</div>
                          <div className="font-medium text-slate-700">{job.jobType || 'Full Time'}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-[10px] uppercase font-semibold">Salary</div>
                          <div className="font-medium text-slate-700">{job.salaryRange || '₹4–8 LPA'}</div>
                        </div>
                      </div>

                      <div>
                        <div className="text-slate-400 text-[10px] uppercase font-semibold mb-1">
                          Required Skills ({jSkills.length})
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {jSkills.map(s => (
                            <span
                              key={s.id}
                              className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: COMPANIES */}
          {activeTab === 'companies' && (
            <div className="space-y-4">
              {/* Desktop and Tablet: Table */}
              <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                    <tr>
                      <th className="p-2.5 lg:p-3.5">Company ID</th>
                      <th className="p-2.5 lg:p-3.5">Company Name</th>
                      <th className="p-2.5 lg:p-3.5">Industry</th>
                      <th className="p-2.5 lg:p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {companies.map(company => (
                      <tr key={company.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-2.5 lg:p-3.5 font-mono text-slate-500 font-medium">{company.id}</td>
                        <td className="p-2.5 lg:p-3.5 font-bold text-slate-900 flex items-center gap-2">
                          <Building className="w-4 h-4 text-slate-400" />
                          <span>{company.name}</span>
                        </td>
                        <td className="p-2.5 lg:p-3.5 text-slate-600 font-medium">{company.industry}</td>
                        <td className="p-2.5 lg:p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditCompany(company)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Company"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirmation({
                                  type: 'company',
                                  id: company.id,
                                  name: company.name,
                                  relationshipsDescription: `Any jobs linked via (:POSTED_BY) from ${company.name} will have their company reference removed.`
                                })
                              }
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Company"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile: Cards */}
              <div className="md:hidden space-y-3">
                {companies.map(company => (
                  <Card key={company.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{company.name}</div>
                          <div className="text-[11px] font-mono text-slate-400">ID: {company.id}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditCompany(company)}
                          className="p-2 min-w-[38px] min-h-[38px] flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          aria-label="Edit Company"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirmation({
                              type: 'company',
                              id: company.id,
                              name: company.name,
                              relationshipsDescription: `Any jobs linked via (:POSTED_BY) from ${company.name} will have their company reference removed.`
                            })
                          }
                          className="p-2 min-w-[38px] min-h-[38px] flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          aria-label="Delete Company"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-slate-400">Industry:</span>
                      <span className="font-semibold text-slate-800">{company.industry}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              {/* Desktop and Tablet: Table */}
              <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                    <tr>
                      <th className="p-2.5 lg:p-3.5">Skill ID</th>
                      <th className="p-2.5 lg:p-3.5">Skill Name</th>
                      <th className="p-2.5 lg:p-3.5">Category</th>
                      <th className="p-2.5 lg:p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {skills.map(skill => (
                      <tr key={skill.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-2.5 lg:p-3.5 font-mono text-slate-500 font-medium">{skill.id}</td>
                        <td className="p-2.5 lg:p-3.5 font-bold text-slate-900 flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          <span>{skill.name}</span>
                        </td>
                        <td className="p-2.5 lg:p-3.5">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                            {skill.category}
                          </span>
                        </td>
                        <td className="p-2.5 lg:p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditSkill(skill)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Skill"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirmation({
                                  type: 'skill',
                                  id: skill.id,
                                  name: skill.name,
                                  relationshipsDescription: `All student (:HAS_SKILL) edges and all job (:REQUIRES_SKILL) edges pointing to "${skill.name}" will be deleted from Neo4j.`
                                })
                              }
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Skill"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile: Cards */}
              <div className="md:hidden space-y-3">
                {skills.map(skill => (
                  <Card key={skill.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{skill.name}</div>
                          <div className="text-[11px] font-mono text-slate-400">ID: {skill.id}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditSkill(skill)}
                          className="p-2 min-w-[38px] min-h-[38px] flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          aria-label="Edit Skill"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirmation({
                              type: 'skill',
                              id: skill.id,
                              name: skill.name,
                              relationshipsDescription: `All student (:HAS_SKILL) edges and all job (:REQUIRES_SKILL) edges pointing to "${skill.name}" will be deleted from Neo4j.`
                            })
                          }
                          className="p-2 min-w-[38px] min-h-[38px] flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          aria-label="Delete Skill"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-slate-400">Category:</span>
                      <span className="font-semibold text-slate-800">{skill.category}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ============================================================== */}
      {/* ADD / EDIT MODALS */}
      {/* ============================================================== */}

      {/* STUDENT MODAL */}
      {activeModal?.type === 'student' && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={e => {
            if (e.target === e.currentTarget) setActiveModal(null);
          }}
        >
          <Card className="p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {activeModal.mode === 'add' ? 'Add Student Node (:Student)' : 'Edit Student Node'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Node representation with (:HAS_SKILL) graph relationships
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitStudent} className="space-y-4 text-xs">
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg text-blue-900 space-y-1">
                <div className="font-semibold text-[11px] flex items-center gap-1.5">
                  <Network className="w-3.5 h-3.5 text-blue-600" />
                  Graph Relationship Preview
                </div>
                <div className="font-mono text-[11px] text-blue-700">
                  (:Student {`{ name: "${studentFormData.name || 'Student'}" }`}) -[:HAS_SKILL]-&gt; ({studentFormData.selectedSkills.length} :Skill nodes)
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Student ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    readOnly={activeModal.mode === 'edit'}
                    value={studentFormData.id}
                    onChange={e => setStudentFormData({ ...studentFormData, id: e.target.value })}
                    className={`w-full p-2 rounded-lg border font-mono text-xs ${
                      activeModal.mode === 'edit'
                        ? 'bg-slate-100 border-slate-200 text-slate-500'
                        : 'bg-white border-slate-300 focus:border-blue-600'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jitesh Choudhary"
                    value={studentFormData.name}
                    onChange={e => setStudentFormData({ ...studentFormData, name: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. jitesh@example.com"
                    value={studentFormData.email}
                    readOnly={activeModal.mode === 'edit'}
                    onChange={e => setStudentFormData({ ...studentFormData, email: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:border-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Education <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BCA"
                    value={studentFormData.degree}
                    onChange={e => setStudentFormData({ ...studentFormData, degree: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Experience Level
                  </label>
                  <select
                    value={studentFormData.experienceLevel}
                    onChange={e => setStudentFormData({ ...studentFormData, experienceLevel: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="Fresher">Fresher</option>
                    <option value="0–1 years">0–1 years</option>
                    <option value="1–3 years">1–3 years</option>
                    <option value="3+ years">3+ years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pune"
                    value={studentFormData.preferredLocation}
                    onChange={e => setStudentFormData({ ...studentFormData, preferredLocation: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              {/* Multi-select Skills */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-700 font-semibold">
                    Skills: Student → HAS_SKILL → Skill ({studentFormData.selectedSkills.length} selected)
                  </label>
                  <span className="text-[11px] text-slate-400">Click to toggle</span>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Filter taxonomy skills..."
                    value={skillSearchQuery}
                    onChange={e => setSkillSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg max-h-36 overflow-y-auto">
                  {filteredSkillsForModal.map(sk => {
                    const isChecked = studentFormData.selectedSkills.includes(sk.id);
                    return (
                      <button
                        type="button"
                        key={sk.id}
                        onClick={() => {
                          const next = isChecked
                            ? studentFormData.selectedSkills.filter(id => id !== sk.id)
                            : [...studentFormData.selectedSkills, sk.id];
                          setStudentFormData({ ...studentFormData, selectedSkills: next });
                        }}
                        className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer border ${
                          isChecked
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {isChecked ? `✓ ${sk.name}` : `+ ${sk.name}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveModal(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={submitting}
                >
                  {activeModal.mode === 'add' ? 'Create Student' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* JOB MODAL */}
      {activeModal?.type === 'job' && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={e => {
            if (e.target === e.currentTarget) setActiveModal(null);
          }}
        >
          <Card className="p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {activeModal.mode === 'add' ? 'Create Job Node (:Job)' : 'Edit Job Node'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configures Job → Company, Job → Location &amp; Job → Required Skills
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitJob} className="space-y-4 text-xs">
              {/* Neo4j Relationship Concept Banner */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg text-indigo-900 space-y-1">
                <div className="font-semibold text-[11px] flex items-center gap-1.5">
                  <Network className="w-3.5 h-3.5 text-indigo-600" />
                  Graph Relationships Built
                </div>
                <div className="font-mono text-[11px] text-indigo-700">
                  (:Job) -[:POSTED_BY]-&gt; (:Company {`{ name: "${jobFormData.company || 'Company'}" }`})
                </div>
                <div className="font-mono text-[11px] text-indigo-700">
                  (:Job) -[:REQUIRES_SKILL]-&gt; ({jobFormData.selectedSkills.length} :Skill nodes)
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Job Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Backend Developer"
                    value={jobFormData.title}
                    onChange={e => setJobFormData({ ...jobFormData, title: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:border-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Company (Job → Company) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={jobFormData.company || companies[0]?.name}
                    onChange={e => setJobFormData({ ...jobFormData, company: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                  >
                    {companies.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.industry})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Location (Job → Location) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pune"
                    value={jobFormData.location}
                    onChange={e => setJobFormData({ ...jobFormData, location: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:border-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Job Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={jobFormData.jobType}
                    onChange={e => setJobFormData({ ...jobFormData, jobType: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Internship">Internship</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Salary Min (LPA) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={jobFormData.salaryMin}
                    onChange={e => setJobFormData({ ...jobFormData, salaryMin: parseInt(e.target.value) || 4 })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:border-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Salary Max (LPA) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={jobFormData.salaryMax}
                    onChange={e => setJobFormData({ ...jobFormData, salaryMax: parseInt(e.target.value) || 8 })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:border-blue-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Experience Required <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={jobFormData.experienceLevel}
                    onChange={e => setJobFormData({ ...jobFormData, experienceLevel: e.target.value as any })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                  >
                    <option value="Fresher">Fresher</option>
                    <option value="0–1 years">0–1 years</option>
                    <option value="1–3 years">1–3 years</option>
                    <option value="3+ years">3+ years</option>
                  </select>
                </div>
              </div>

              {/* Required Skills (Job → Required Skills) */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-700 font-semibold">
                    Required Skills (Job → Required Skills)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {jobFormData.selectedSkills.length} selected
                  </span>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search taxonomy skills..."
                    value={skillSearchQuery}
                    onChange={e => setSkillSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg max-h-36 overflow-y-auto">
                  {filteredSkillsForModal.map(sk => {
                    const isChecked = jobFormData.selectedSkills.includes(sk.id);
                    return (
                      <button
                        type="button"
                        key={sk.id}
                        onClick={() => {
                          const next = isChecked
                            ? jobFormData.selectedSkills.filter(id => id !== sk.id)
                            : [...jobFormData.selectedSkills, sk.id];
                          setJobFormData({ ...jobFormData, selectedSkills: next });
                        }}
                        className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer border ${
                          isChecked
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {isChecked ? `✓ ${sk.name}` : `+ ${sk.name}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveModal(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={submitting}
                >
                  {activeModal.mode === 'add' ? 'Create Job' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* COMPANY MODAL */}
      {activeModal?.type === 'company' && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={e => {
            if (e.target === e.currentTarget) setActiveModal(null);
          }}
        >
          <Card className="p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {activeModal.mode === 'add' ? 'Add Company (:Company)' : 'Edit Company'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Employer node participating in (:POSTED_BY) edges
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCompany} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Company Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ABC Technologies"
                  value={companyFormData.name}
                  onChange={e => setCompanyFormData({ ...companyFormData, name: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Industry <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Information Technology"
                  value={companyFormData.industry}
                  onChange={e => setCompanyFormData({ ...companyFormData, industry: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:border-blue-600 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveModal(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={submitting}
                >
                  {activeModal.mode === 'add' ? 'Register Company' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* SKILL MODAL */}
      {activeModal?.type === 'skill' && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={e => {
            if (e.target === e.currentTarget) setActiveModal(null);
          }}
        >
          <Card className="p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {activeModal.mode === 'add' ? 'Add Skill Node (:Skill)' : 'Edit Skill Node'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ontology node linking (:Student) and (:Job) nodes
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSkill} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Skill Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Docker"
                  value={skillFormData.name}
                  onChange={e => setSkillFormData({ ...skillFormData, name: e.target.value })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={skillFormData.category}
                  onChange={e => setSkillFormData({ ...skillFormData, category: e.target.value as SkillCategory })}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                >
                  <option value="Languages">Languages</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Database">Database</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                  <option value="Core CS & Tools">Core CS & Tools</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveModal(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={submitting}
                >
                  {activeModal.mode === 'add' ? 'Create Skill' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ============================================================== */}
      {/* POLISHED DELETE CONFIRMATION MODAL */}
      {/* ============================================================== */}
      {deleteConfirmation && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={e => {
            if (e.target === e.currentTarget) setDeleteConfirmation(null);
          }}
        >
          <Card className="p-6 w-full max-w-md shadow-2xl space-y-4 border-rose-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-rose-100 text-rose-600 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Delete this record?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to delete <span className="font-bold text-slate-900">"{deleteConfirmation.name}"</span>?
                </p>
              </div>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-lg text-[11px] text-rose-900 leading-relaxed space-y-1.5">
              <div className="font-semibold text-rose-800 flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5 text-rose-700" />
                Graph Relationship Impact Notice:
              </div>
              <p>
                {deleteConfirmation.relationshipsDescription} This operation will remove the selected graph entity and its associated relationships from Neo4j.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={submitting}
                onClick={() => setDeleteConfirmation(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                isLoading={submitting}
                onClick={handleConfirmDelete}
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
