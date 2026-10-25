import React, { useState, useEffect } from 'react';
import { useRouter } from '../router/RouterContext';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Sparkles,
  Briefcase,
  Building2,
  CheckCircle2,
  ArrowRight,
  Share2,
  Shield,
  Layers,
  Percent,
  Search,
  Database,
  LogIn
} from 'lucide-react';
import { Button, Card, Badge } from '../components/design-system';

export const LandingPage: React.FC = () => {
  const { setRole, navigate } = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [activeHoverNode, setActiveHoverNode] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated && user) {
      setRole(user.role);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } else {
      navigate('/signup');
    }
  };

  const handleLogin = () => {
    if (isAuthenticated && user) {
      setRole(user.role);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleCreateProfile = () => {
    if (isAuthenticated && user) {
      setRole(user.role);
      navigate('/profile');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pt-1 sm:pt-3 pb-8 sm:pb-12">
      {/* 1. HERO SECTION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-start">
          {/* Left Column: Hero Copy & Actions */}
          <div
            className={`lg:col-span-6 space-y-5 lg:pt-4 transition-all duration-700 ease-out ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/90 text-blue-700 text-xs font-semibold">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>Neo4j Graph Database System</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-[1.15]">
              Find Jobs That Match Your Skills
            </h1>

            <p className="text-base text-slate-600 leading-relaxed max-w-xl">
              JobGraph uses graph-based relationships to connect your skills with job requirements, identify skill gaps, and recommend opportunities that fit your profile.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRight className="w-4 h-4" />}
                onClick={handleGetStarted}
                className="shadow-sm"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
              </Button>

              <Button
                variant="outline"
                size="lg"
                icon={<LogIn className="w-4 h-4 text-slate-500" />}
                onClick={handleLogin}
              >
                {isAuthenticated ? 'My Account' : 'Log In'}
              </Button>
            </div>
          </div>

          {/* Right Column: Interactive Graph Concept Visualizer */}
          <div
            className={`lg:col-span-6 transition-all duration-1000 ease-out delay-200 ${
              isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'
            }`}
          >
            <div className="relative p-6 sm:p-7 bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
              {/* Subtle background graph grid pattern */}
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(#1E293B 1px, transparent 1px)`,
                  backgroundSize: '16px 16px'
                }}
              />

              {/* Visual Flow Indicator Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-blue-600" />
                  Bipartite Graph Topology
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Student → Skills → Jobs → Companies
                </span>
              </div>

              {/* The Graph Visual SVG Canvas */}
              <div className="relative">
                <svg
                  viewBox="0 0 460 440"
                  className="w-full h-auto select-none"
                >
                  <defs>
                    {/* Gradients */}
                    <linearGradient id="link-grad-blue" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.85" />
                    </linearGradient>
                    <linearGradient id="link-grad-sky" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.85" />
                    </linearGradient>
                    <linearGradient id="link-grad-emerald" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.85" />
                      <stop offset="100%" stopColor="#16A34A" stopOpacity="0.85" />
                    </linearGradient>

                    {/* Arrow markers */}
                    <marker id="arrow-down-blue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <path d="M0,0 L6,3 L0,6 Z" fill="#3B82F6" />
                    </marker>
                    <marker id="arrow-down-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <path d="M0,0 L6,3 L0,6 Z" fill="#0284C7" />
                    </marker>
                    <marker id="arrow-down-green" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <path d="M0,0 L6,3 L0,6 Z" fill="#16A34A" />
                    </marker>
                  </defs>

                  {/* =========================================
                      LEVEL 1 -> LEVEL 2 (Student to Skills)
                      ========================================= */}
                  <g className="transition-opacity duration-300">
                    {/* Student (230, 48) to Java (80, 155) */}
                    <path
                      d="M 200 48 C 140 70, 95 110, 80 140"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="1.8"
                      strokeDasharray="140"
                      strokeDashoffset="140"
                      className="animate-line-draw stagger-1"
                      markerEnd="url(#arrow-down-blue)"
                    />
                    {/* Student (230, 48) to Python (180, 155) */}
                    <path
                      d="M 220 48 C 205 75, 190 110, 180 140"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2"
                      strokeDasharray="120"
                      strokeDashoffset="120"
                      className="animate-line-draw stagger-2"
                      markerEnd="url(#arrow-down-blue)"
                    />
                    {/* Student (230, 48) to MongoDB (280, 155) */}
                    <path
                      d="M 240 48 C 255 75, 270 110, 280 140"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2"
                      strokeDasharray="120"
                      strokeDashoffset="120"
                      className="animate-line-draw stagger-2"
                      markerEnd="url(#arrow-down-blue)"
                    />
                    {/* Student (230, 48) to Git (380, 155) */}
                    <path
                      d="M 260 48 C 320 70, 365 110, 380 140"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="1.8"
                      strokeDasharray="140"
                      strokeDashoffset="140"
                      className="animate-line-draw stagger-3"
                      markerEnd="url(#arrow-down-blue)"
                    />
                  </g>

                  {/* Level 1 -> Level 2 Arrow Relationship Badge (:HAS_SKILL) */}
                  <g transform="translate(230, 95)" className="select-none pointer-events-none">
                    <rect x="-42" y="-10" width="84" height="20" rx="10" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="1.2" filter="drop-shadow(0 1px 3px rgba(37,99,235,0.15))" />
                    <text textAnchor="middle" dy="0.32em" fill="#1D4ED8" fontSize="9.5" fontWeight="700" fontFamily="monospace">
                      :HAS_SKILL
                    </text>
                  </g>

                  {/* =========================================
                      LEVEL 2 -> LEVEL 3 (Skills to Backend Developer)
                      ========================================= */}
                  <g className="transition-opacity duration-300">
                    {/* Java (80, 175) to Backend Developer (230, 285) */}
                    <path
                      d="M 80 190 C 95 230, 170 270, 205 285"
                      fill="none"
                      stroke="#0284C7"
                      strokeWidth="1.8"
                      strokeDasharray="150"
                      strokeDashoffset="150"
                      className="animate-line-draw stagger-4"
                      markerEnd="url(#arrow-down-cyan)"
                    />
                    {/* Python (180, 175) to Backend Developer (230, 285) */}
                    <path
                      d="M 180 190 C 190 225, 210 260, 220 285"
                      fill="none"
                      stroke="#0284C7"
                      strokeWidth="2"
                      strokeDasharray="120"
                      strokeDashoffset="120"
                      className="animate-line-draw stagger-4"
                      markerEnd="url(#arrow-down-cyan)"
                    />
                    {/* MongoDB (280, 175) to Backend Developer (230, 285) */}
                    <path
                      d="M 280 190 C 270 225, 250 260, 240 285"
                      fill="none"
                      stroke="#0284C7"
                      strokeWidth="2"
                      strokeDasharray="120"
                      strokeDashoffset="120"
                      className="animate-line-draw stagger-5"
                      markerEnd="url(#arrow-down-cyan)"
                    />
                    {/* Git (380, 175) to Backend Developer (230, 285) */}
                    <path
                      d="M 380 190 C 365 230, 290 270, 255 285"
                      fill="none"
                      stroke="#0284C7"
                      strokeWidth="1.8"
                      strokeDasharray="150"
                      strokeDashoffset="150"
                      className="animate-line-draw stagger-5"
                      markerEnd="url(#arrow-down-cyan)"
                    />
                  </g>

                  {/* Level 2 -> Level 3 Arrow Relationship Badge (:REQUIRES_SKILL) */}
                  <g transform="translate(230, 238)" className="select-none pointer-events-none">
                    <rect x="-54" y="-10" width="108" height="20" rx="10" fill="#F0FDF4" stroke="#86EFAC" strokeWidth="1.2" filter="drop-shadow(0 1px 3px rgba(22,163,74,0.15))" />
                    <text textAnchor="middle" dy="0.32em" fill="#15803D" fontSize="9.5" fontWeight="700" fontFamily="monospace">
                      :REQUIRES_SKILL
                    </text>
                  </g>

                  {/* =========================================
                      LEVEL 3 -> LEVEL 4 (Backend Developer to ABC Technologies)
                      ========================================= */}
                  <line
                    x1="230"
                    y1="322"
                    x2="230"
                    y2="378"
                    stroke="#16A34A"
                    strokeWidth="2.2"
                    strokeDasharray="70"
                    strokeDashoffset="70"
                    className="animate-line-draw stagger-6"
                    markerEnd="url(#arrow-down-green)"
                  />

                  {/* Level 3 -> Level 4 Arrow Relationship Badge (:POSTED_BY) */}
                  <g transform="translate(230, 350)" className="select-none pointer-events-none">
                    <rect x="-38" y="-9" width="76" height="18" rx="9" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="1.2" filter="drop-shadow(0 1px 3px rgba(16,185,129,0.12))" />
                    <text textAnchor="middle" dy="0.32em" fill="#047857" fontSize="9" fontWeight="700" fontFamily="monospace">
                      :POSTED_BY
                    </text>
                  </g>

                  {/* =========================================
                      NODE LEVEL 1: STUDENT
                      ========================================= */}
                  <g
                    transform="translate(230, 32)"
                    className="cursor-pointer animate-node-pop stagger-1"
                    onMouseEnter={() => setActiveHoverNode('student')}
                    onMouseLeave={() => setActiveHoverNode(null)}
                  >
                    <rect x="-72" y="-18" width="144" height="36" rx="10" fill="#2563EB" filter="drop-shadow(0 3px 6px rgba(37,99,235,0.28))" />
                    <circle cx="-50" cy="0" r="4.5" fill="#93C5FD" />
                    <text textAnchor="middle" x="6" dy="0.35em" fill="#FFFFFF" fontSize="12" fontWeight="bold">
                      Student
                    </text>
                  </g>

                  {/* =========================================
                      NODE LEVEL 2: SKILLS (Java, Python, MongoDB, Git)
                      ========================================= */}
                  {/* Skill 1: Java */}
                  <g
                    transform="translate(80, 165)"
                    className="cursor-pointer animate-node-pop stagger-2"
                    onMouseEnter={() => setActiveHoverNode('java')}
                    onMouseLeave={() => setActiveHoverNode(null)}
                  >
                    <rect x="-32" y="-15" width="64" height="30" rx="8" fill="#FFF1F2" stroke="#FDA4AF" strokeWidth="1.5" filter="drop-shadow(0 2px 4px rgba(225,29,72,0.08))" />
                    <text textAnchor="middle" dy="0.35em" fill="#BE123C" fontSize="11" fontWeight="bold">
                      Java
                    </text>
                  </g>

                  {/* Skill 2: Python */}
                  <g
                    transform="translate(180, 165)"
                    className="cursor-pointer animate-node-pop stagger-3"
                    onMouseEnter={() => setActiveHoverNode('python')}
                    onMouseLeave={() => setActiveHoverNode(null)}
                  >
                    <rect x="-34" y="-15" width="68" height="30" rx="8" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="1.5" filter="drop-shadow(0 2px 4px rgba(37,99,235,0.08))" />
                    <text textAnchor="middle" dy="0.35em" fill="#1D4ED8" fontSize="11" fontWeight="bold">
                      Python
                    </text>
                  </g>

                  {/* Skill 3: MongoDB */}
                  <g
                    transform="translate(280, 165)"
                    className="cursor-pointer animate-node-pop stagger-3"
                    onMouseEnter={() => setActiveHoverNode('mongodb')}
                    onMouseLeave={() => setActiveHoverNode(null)}
                  >
                    <rect x="-38" y="-15" width="76" height="30" rx="8" fill="#F0FDF4" stroke="#86EFAC" strokeWidth="1.5" filter="drop-shadow(0 2px 4px rgba(22,163,74,0.08))" />
                    <text textAnchor="middle" dy="0.35em" fill="#15803D" fontSize="11" fontWeight="bold">
                      MongoDB
                    </text>
                  </g>

                  {/* Skill 4: Git */}
                  <g
                    transform="translate(380, 165)"
                    className="cursor-pointer animate-node-pop stagger-4"
                    onMouseEnter={() => setActiveHoverNode('git')}
                    onMouseLeave={() => setActiveHoverNode(null)}
                  >
                    <rect x="-30" y="-15" width="60" height="30" rx="8" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="1.5" filter="drop-shadow(0 2px 4px rgba(234,88,12,0.08))" />
                    <text textAnchor="middle" dy="0.35em" fill="#C2410C" fontSize="11" fontWeight="bold">
                      Git
                    </text>
                  </g>

                  {/* =========================================
                      NODE LEVEL 3: BACKEND DEVELOPER (JOB)
                      ========================================= */}
                  <g
                    transform="translate(230, 304)"
                    className="cursor-pointer animate-node-pop stagger-5"
                    onMouseEnter={() => setActiveHoverNode('job')}
                    onMouseLeave={() => setActiveHoverNode(null)}
                  >
                    <rect x="-85" y="-18" width="170" height="36" rx="10" fill="#0F172A" filter="drop-shadow(0 3px 6px rgba(15,23,42,0.28))" />
                    <circle cx="-62" cy="0" r="4.5" fill="#38BDF8" />
                    <text textAnchor="middle" x="6" dy="0.35em" fill="#FFFFFF" fontSize="12" fontWeight="bold">
                      Backend Developer
                    </text>
                  </g>

                  {/* =========================================
                      NODE LEVEL 4: ABC TECHNOLOGIES (COMPANY)
                      ========================================= */}
                  <g
                    transform="translate(230, 396)"
                    className="cursor-pointer animate-node-pop stagger-6"
                    onMouseEnter={() => setActiveHoverNode('company')}
                    onMouseLeave={() => setActiveHoverNode(null)}
                  >
                    <rect x="-80" y="-17" width="160" height="34" rx="9" fill="#16A34A" filter="drop-shadow(0 3px 6px rgba(22,163,74,0.25))" />
                    <circle cx="-58" cy="0" r="4.5" fill="#BBF7D0" />
                    <text textAnchor="middle" x="6" dy="0.35em" fill="#FFFFFF" fontSize="11.5" fontWeight="bold">
                      ABC Technologies
                    </text>
                  </g>
                </svg>
              </div>

              {/* Bottom explanatory caption */}
              <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Neo4j Pointer Hops (Pune · Fresher)</span>
                <span className="font-semibold text-emerald-600">66.7% Match Calculated (4 of 6 Skills)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURE SECTION */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
            Core Capabilities
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Graph-Powered Career Intelligence
          </h2>
        </div>

        {/* The 4 Actual Core Features (as requested) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Feature 1 */}
          <Card className="p-6 space-y-3 hover:border-slate-300 transition-all shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Percent className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              1. Skill-Based Job Matching
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Compare your skills with job requirements.
            </p>
          </Card>

          {/* Feature 2 */}
          <Card className="p-6 space-y-3 hover:border-slate-300 transition-all shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              2. Skill Gap Analysis
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Identify the skills you are missing for specific roles.
            </p>
          </Card>

          {/* Feature 3 */}
          <Card className="p-6 space-y-3 hover:border-slate-300 transition-all shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              3. Skill Improvement
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Discover high-demand skills that can improve your job compatibility.
            </p>
          </Card>

          {/* Feature 4 */}
          <Card className="p-6 space-y-3 hover:border-slate-300 transition-all shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              4. Graph-Based Recommendations
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Use connected job, skill and company data through Neo4j.
            </p>
          </Card>
        </div>

        {/* Conceptual Architecture Card */}
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                System Integration Architecture
              </span>
              <p className="text-xs text-slate-500">
                Frontend is fully decoupled from Neo4j through a standard Express REST API layer.
              </p>
            </div>
            <div className="text-[11px] font-mono text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 self-start sm:self-auto">
              Frontend &rarr; Express API &rarr; Neo4j Driver &rarr; Neo4j DB
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="font-bold text-slate-800 block">1. Frontend Layer</span>
              <p className="text-slate-500 text-[11px]">React SPA emitting standard HTTP requests (GET, POST, PUT) to conceptual <code className="text-slate-700">/api/*</code> routes.</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="font-bold text-slate-800 block">2. Express.js Backend</span>
              <p className="text-slate-500 text-[11px]">Validates parameters, authenticates requests, and queries Neo4j via official JavaScript driver session.</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="font-bold text-slate-800 block">3. Neo4j Graph DB</span>
              <p className="text-slate-500 text-[11px]">Evaluates skill overlaps and bridge opportunities deterministically via native Cypher relationship traversals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION (Simple 4-Step Visual) */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
            Process Flow
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How It Works
          </h2>
        </div>

        {/* 4-Step Visual Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Step 01 */}
          <Card className="p-6 relative flex flex-col justify-between space-y-4">
            <div>
              <span className="font-mono text-2xl font-bold text-blue-600 block mb-2">
                01
              </span>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Create Profile
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Set up your academic record, degree, and career specialization.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Step 1</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Card>

          {/* Step 02 */}
          <Card className="p-6 relative flex flex-col justify-between space-y-4">
            <div>
              <span className="font-mono text-2xl font-bold text-blue-600 block mb-2">
                02
              </span>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Add Skills
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Connect your technical skills with verified proficiency levels.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Step 2</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Card>

          {/* Step 03 */}
          <Card className="p-6 relative flex flex-col justify-between space-y-4">
            <div>
              <span className="font-mono text-2xl font-bold text-blue-600 block mb-2">
                03
              </span>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Find Matching Jobs
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Traverse bipartite relationships to calculate exact match percentages.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Step 3</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Card>

          {/* Step 04 */}
          <Card className="p-6 relative flex flex-col justify-between space-y-4">
            <div>
              <span className="font-mono text-2xl font-bold text-blue-600 block mb-2">
                04
              </span>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Identify Skill Gaps
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Uncover missing requirements and discover career bridge skills.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Step 4</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </Card>
        </div>
      </section>

      {/* 4. FINAL CTA SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <Card className="p-8 sm:p-12 text-center space-y-6 bg-slate-900 text-white border-slate-800 shadow-lg">
          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Ready to discover your best job matches?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Start by building your academic skill inventory and let the graph engine compute your career compatibility.
            </p>
          </div>

          <div>
            <Button
              variant="primary"
              size="lg"
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={handleCreateProfile}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold"
            >
              Create Your Profile
            </Button>
          </div>
        </Card>
      </section>

      {/* 5. SIMPLE FOOTER */}
      <footer className="pt-8 border-t border-slate-200 text-center text-xs text-slate-500 space-y-1">
        <div className="font-bold text-slate-800 text-sm">JobGraph</div>
        <div>Graph-Based Job Skill Matcher</div>
      </footer>
    </div>
  );
};
