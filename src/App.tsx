import React, { useState, useEffect, useCallback } from 'react';
import { RouterProvider, useRouter } from './router/RouterContext';
import {
  StudentNode,
  SkillNode,
  JobNode,
  ProficiencyLevel,
  JobMatchCalculation,
  BridgeSkillAnalysis
} from './types/graph';
import { graphDb } from './services/apiClient';
import { jobGraphApi } from './services/jobGraphApi';
import { studentProfileApi, StudentProfile, StudentSkillRecord } from './services/studentProfileApi';
import { Navigation } from './components/Navigation';
import { LandingPage } from './pages/LandingPage';
import { StudentProfilePage } from './pages/StudentProfilePage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { JobRecommendationsPage } from './pages/JobRecommendationsPage';
import { JobDetailsPage } from './pages/JobDetailsPage';
import { SkillImprovementPage } from './pages/SkillImprovementPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminManagePage } from './pages/AdminManagePage';
import { AuthPage } from './pages/AuthPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoadingSkeleton, ErrorState } from './components/StateFeedback';
import { ToastProvider } from './components/design-system/ToastNotification';
import { BrandedLoadingScreen } from './components/design-system/BrandedLoadingScreen';

function MainLayout() {
  const { path, navigate } = useRouter();
  const { user, isRestoringSession } = useAuth();
  const [initialScreenDone, setInitialScreenDone] = useState(false);

  const [students, setStudents] = useState<StudentNode[]>([]);
  const [activeStudentId, setActiveStudentId] = useState<string>('');
  const [persistedProfile, setPersistedProfile] = useState<StudentProfile | null>(null);
  const [persistedSkills, setPersistedSkills] = useState<SkillNode[]>([]);
  const [persistedStudentSkills, setPersistedStudentSkills] = useState<StudentSkillRecord[]>([]);
  const [skills, setSkills] = useState<SkillNode[]>([]);
  const [jobs, setJobs] = useState<JobNode[]>([]);
  const [studentSkills, setStudentSkills] = useState<Array<{
    skill: SkillNode;
    proficiency: ProficiencyLevel;
    verified: boolean;
    acquiredDate: string;
  }>>([]);
  const [matches, setMatches] = useState<JobMatchCalculation[]>([]);
  const [bridgeSkills, setBridgeSkills] = useState<BridgeSkillAnalysis[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sync active student with authenticated user if student role
  useEffect(() => {
    if (user?.role === 'student' && user.studentId) {
      setActiveStudentId(user.studentId);
    }
  }, [user]);

  // Client-side route guard. API endpoints must still enforce authorization server-side.
  useEffect(() => {
    if (isRestoringSession || path === '/' || path === '/login' || path === '/signup') return;
    if (!user) {
      // Preserve the requested page only as navigation context; protected data is not rendered.
      navigate('/login');
      return;
    }
    if (path.startsWith('/admin') && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [path, user, isRestoringSession, navigate]);

  const loadData = useCallback(async () => {
    setError(null);

    // Do not issue protected data requests while signed out or while restoring a session.
    // In particular, /api/admin/students must never be called for a student account.
    if (isRestoringSession || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Jobs and the skill catalogue are public data. Fetch them for both roles.
      const [fallbackSkills, fetchedJobs] = await Promise.all([
        graphDb.getSkills(),
        jobGraphApi.getJobs()
      ]);
      setJobs(fetchedJobs);

      if (user.role === 'student') {
        // A student only fetches their own profile. Never call the admin-only student list.
        const [profileResult, databaseSkills] = await Promise.all([
          studentProfileApi.getMe(),
          studentProfileApi.getSkills()
        ]);
        setPersistedProfile(profileResult.profile);
        setPersistedStudentSkills(profileResult.skills);
        setPersistedSkills(databaseSkills);
        setSkills(databaseSkills);
        setStudentSkills(profileResult.skills);
        setActiveStudentId(profileResult.profile.id);
        setStudents([profileResult.profile]);

        const [fetchedMatches, fetchedBridges] = await Promise.all([
          jobGraphApi.getStudentMatches(profileResult.profile.id),
          graphDb.getBridgeSkillAnalysis(profileResult.profile.id)
        ]);
        setMatches(fetchedMatches);
        setBridgeSkills(fetchedBridges);
      } else {
        // The administrator-only student collection is fetched only for administrators.
        const fetchedStudents = await graphDb.getStudents();
        setStudents(fetchedStudents);
        setPersistedProfile(null);
        setPersistedStudentSkills([]);
        setPersistedSkills([]);
        setSkills(fallbackSkills);
        if (fetchedStudents.length > 0) {
          const validStudentId = fetchedStudents.some(s => s.id === activeStudentId)
            ? activeStudentId
            : fetchedStudents[0].id;
          const [fetchedStudentSkills, fetchedMatches, fetchedBridges] = await Promise.all([
            graphDb.getStudentSkills(validStudentId),
            jobGraphApi.getStudentMatches(validStudentId),
            graphDb.getBridgeSkillAnalysis(validStudentId)
          ]);
          setStudentSkills(fetchedStudentSkills);
          setMatches(fetchedMatches);
          setBridgeSkills(fetchedBridges);
        } else {
          setStudentSkills([]);
          setMatches([]);
          setBridgeSkills([]);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to load graph data');
    } finally {
      setLoading(false);
    }
  }, [activeStudentId, user, isRestoringSession]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Skill updates
  const persistSkillChanges = async (nextSkills: StudentSkillRecord[]) => {
    const savedSkills = await studentProfileApi.saveSkills(
      nextSkills.map(item => ({ id: item.skill.id, proficiency: item.proficiency }))
    );
    setPersistedStudentSkills(savedSkills);
    setStudentSkills(savedSkills);
    return savedSkills;
  };

  const handleUpdateSkillProficiency = async (skillId: string, level: ProficiencyLevel) => {
    try {
      if (user?.role === 'student' && persistedProfile) {
        await persistSkillChanges(persistedStudentSkills.map(item =>
          item.skill.id === skillId ? { ...item, proficiency: level } : item
        ));
      } else {
        await graphDb.setStudentSkill(activeStudentId, skillId, level);
        await loadData();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update skill');
    }
  };

  const handleAddSkill = async (skillId: string, level: ProficiencyLevel) => {
    try {
      if (user?.role === 'student' && persistedProfile) {
        const next = persistedStudentSkills.filter(item => item.skill.id !== skillId);
        const skill = persistedSkills.find(item => item.id === skillId);
        if (!skill) throw new Error('Selected skill is not in the database catalogue.');
        next.push({ skill, proficiency: level, verified: false, acquiredDate: new Date().toISOString().slice(0, 10) });
        await persistSkillChanges(next);
      } else {
        await graphDb.setStudentSkill(activeStudentId, skillId, level);
        await loadData();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to add skill');
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    try {
      if (user?.role === 'student' && persistedProfile) {
        await persistSkillChanges(persistedStudentSkills.filter(item => item.skill.id !== skillId));
      } else {
        await graphDb.removeStudentSkill(activeStudentId, skillId);
        await loadData();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to remove skill');
    }
  };

  const handleSaveProfile = async (
    updatedStudent: Partial<StudentNode>,
    selectedSkillIds: string[]
  ) => {
    if (!user || user.role !== 'student') {
      throw new Error('Only the signed-in student can update this profile.');
    }
    const saved = await studentProfileApi.saveProfile({
      name: String(updatedStudent.name || ''),
      degree: String(updatedStudent.degree || ''),
      experienceLevel: String(updatedStudent.experienceLevel || 'Fresher'),
      preferredLocation: String(updatedStudent.preferredLocation || ''),
      targetRole: String(updatedStudent.targetRole || ''),
    }, selectedSkillIds);
    setPersistedProfile(saved.profile);
    setPersistedStudentSkills(saved.skills);
    setStudentSkills(saved.skills);
    setStudents(prev => prev.map(student => student.id === saved.profile.id ? saved.profile : student));
    await loadData();
  };

  const activeStudent = persistedProfile || students.find(s => s.id === activeStudentId) || students[0];

  // Route Dispatcher matching exactly the 8 requested primary pages
  const renderPage = () => {
    // Authentication must remain usable even if job/graph data requests fail.
    if (path === '/login') return <AuthPage initialMode="login" />;
    if (path === '/signup') return <AuthPage initialMode="signup" />;
    if (path === '/') return <LandingPage />;

    if (isRestoringSession) {
      return <LoadingSkeleton message="Restoring secure session..." />;
    }
    if (!user) return <AuthPage initialMode="login" />;
    if (path.startsWith('/admin') && user.role !== 'admin') {
      return <LoadingSkeleton message="Checking administrator access..." />;
    }
    if (loading) {
      return <LoadingSkeleton message="Traversing Neo4j Graph Relationships..." />;
    }

    if (error) {
      return <ErrorState message={error} onRetry={loadData} />;
    }

    // 2. Student Profile: /profile
    if (path === '/profile') {
      return (
        <StudentProfilePage
          activeStudent={persistedProfile || activeStudent}
          allSkills={user?.role === 'student' ? persistedSkills : skills}
          studentSkills={user?.role === 'student' ? persistedStudentSkills : studentSkills}
          onSaveProfile={handleSaveProfile}
        />
      );
    }

    // 3. Student Dashboard: /dashboard
    if (path === '/dashboard') {
      return (
        <StudentDashboardPage
          activeStudent={activeStudent}
          studentSkills={studentSkills}
          matches={matches}
          bridgeSkills={bridgeSkills}
          isLoading={loading}
          error={error}
          onRetry={loadData}
        />
      );
    }

    // 4. Job Recommendations: /jobs
    if (path === '/jobs') {
      return (
        <JobRecommendationsPage
          activeStudent={activeStudent}
          matches={matches}
          isLoading={loading}
          error={error}
          onRetry={loadData}
        />
      );
    }

    // 5. Job Details: /job/:id
    if (path.startsWith('/job/')) {
      return (
        <JobDetailsPage
          activeStudent={activeStudent}
          matches={matches}
          jobs={jobs}
          onSimulateLearnSkill={skillId => handleAddSkill(skillId, 'Intermediate')}
        />
      );
    }

    // 6. Skill Improvement: /skills
    if (path === '/skills') {
      return (
        <SkillImprovementPage
          activeStudent={activeStudent}
          bridgeSkills={bridgeSkills}
          matches={matches}
          onLearnSkill={skillId => handleAddSkill(skillId, 'Intermediate')}
        />
      );
    }

    // 7. Admin Dashboard: /admin
    if (path === '/admin') {
      return <AdminDashboardPage />;
    }

    // 8. Admin Data Management: /admin/manage
    if (path === '/admin/manage') {
      return <AdminManagePage />;
    }

    // Fallback: Landing Page
    return <LandingPage />;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {!initialScreenDone && (
        <BrandedLoadingScreen
          ready={!loading}
          onComplete={() => setInitialScreenDone(true)}
        />
      )}

      {/* Shared Navigation (Adapts to Role: Student, Admin, Landing) */}
      <Navigation
        students={students}
        activeStudentId={activeStudentId}
        onSelectStudent={setActiveStudentId}
      />

      {/* Primary Page Viewport */}
      <main
        className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 transition-opacity duration-200 ${
          path === '/'
            ? 'pt-4 sm:pt-6 pb-8 sm:pb-12'
            : path === '/login' || path === '/signup'
            ? 'flex flex-col justify-center items-center py-6 sm:py-10 min-h-[calc(100vh-4.5rem)]'
            : 'py-6 sm:py-8'
        }`}
      >
        {renderPage()}
      </main>

      {/* Footer (Rendered on non-landing and non-auth pages) */}
      {path !== '/' && path !== '/login' && path !== '/signup' && (
        <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 tracking-tight">JOBGRAPH</span>
              <span aria-hidden="true">·</span>
              <span>Graph-Based Job Skill Matching &amp; Skill Gap Analysis System</span>
            </div>

            <div className="flex items-center gap-4 text-slate-400">
              <span>BCA Final Year NoSQL Project</span>
              <span aria-hidden="true">·</span>
              <span>Neo4j Graph Database &amp; Express.js</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <ToastProvider>
          <MainLayout />
        </ToastProvider>
      </AuthProvider>
    </RouterProvider>
  );
}
