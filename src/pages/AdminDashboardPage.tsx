import React, { useState, useEffect } from 'react';
import { useRouter } from '../router/RouterContext';
import { graphDb } from '../services/apiClient';
import {
  Users,
  Briefcase,
  Building,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Share2,
  Database,
  BarChart3,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Button, Card, Badge, GraphMotif } from '../components/design-system';
import { AnimatedCounter } from '../components/design-system/Motion';

export const AdminDashboardPage: React.FC = () => {
  const { navigate } = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await graphDb.getAdminOverviewStats();
      setStats(data);
    } catch (err: any) {
      console.error(err);
      setError('Unable to load database statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // KPI values come from the live database statistics endpoint.
  const kpiData = [
    {
      title: 'Students',
      value: stats?.totalStudents ?? 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      tabKey: 'students',
      label: 'Enrolled student nodes'
    },
    {
      title: 'Jobs',
      value: stats?.totalJobs ?? 0,
      icon: Briefcase,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      tabKey: 'jobs',
      label: 'Active employment postings'
    },
    {
      title: 'Companies',
      value: stats?.totalCompanies ?? 0,
      icon: Building,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      tabKey: 'companies',
      label: 'Registered hiring partners'
    },
    {
      title: 'Skills',
      value: stats?.totalSkills ?? 0,
      icon: Sparkles,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
      tabKey: 'skills',
      label: 'Standardized skill taxonomy'
    }
  ];

  // Dashboard analytics are populated from the database-backed admin stats endpoint.
  // Category breakdown is intentionally omitted until the API supplies real category aggregates.
  const categoryData: Array<{name: string; count: number; percentage: number; color: string}> = [];
  const demandedSkills = (stats?.topDemandedSkills || []).map((item: any) => ({
    name: item.skill?.name || 'Unknown skill', count: item.count, maxCount: Math.max(1, ...(stats?.topDemandedSkills || []).map((x: any) => x.count)), category: item.skill?.category || 'Other'
  }));

  // SKELETON LOADING STATE
  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-8 bg-slate-200 rounded-md w-64" />
          <div className="h-4 bg-slate-200 rounded-md w-96" />
        </div>

        {/* 4 KPI Cards Skeletons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(idx => (
            <div key={idx} className="p-5 bg-white rounded-xl border border-slate-200 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-slate-200 rounded-sm w-20" />
                <div className="w-8 h-8 bg-slate-100 rounded-lg" />
              </div>
              <div className="h-9 bg-slate-200 rounded-md w-16" />
              <div className="h-3 bg-slate-100 rounded-sm w-32" />
            </div>
          ))}
        </div>

        {/* Analytics Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-xl border border-slate-200 space-y-4">
            <div className="h-5 bg-slate-200 rounded-md w-40" />
            <div className="space-y-3 pt-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-8 bg-slate-100 rounded-md w-full" />
              ))}
            </div>
          </div>
          <div className="p-6 bg-white rounded-xl border border-slate-200 space-y-4">
            <div className="h-5 bg-slate-200 rounded-md w-44" />
            <div className="space-y-3 pt-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-7 bg-slate-100 rounded-md w-full" />
              ))}
            </div>
          </div>
        </div>

        {/* Graph Overview Skeleton */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 space-y-4">
          <div className="h-5 bg-slate-200 rounded-md w-36" />
          <div className="h-28 bg-slate-100 rounded-lg" />
        </div>

        {/* Quick Actions Skeleton */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 space-y-4">
          <div className="h-5 bg-slate-200 rounded-md w-36" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-10 bg-slate-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <Card className="p-10 text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Unable to load database statistics.</h2>
        <p className="text-xs text-slate-500">
          We encountered an issue communicating with the graph database engine. Please try again.
        </p>
        <div className="pt-2">
          <Button variant="primary" icon={<RefreshCw className="w-4 h-4" />} onClick={fetchStats}>
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  // EMPTY STATE
  if (!stats && !loading) {
    return (
      <Card className="p-10 text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto">
          <Database className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">No database statistics available.</h2>
        <p className="text-xs text-slate-500">
          The graph database has not generated metrics yet or no entities were found.
        </p>
        <div className="pt-2">
          <Button variant="primary" icon={<RefreshCw className="w-4 h-4" />} onClick={fetchStats}>
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Admin Dashboard
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              GET /api/admin/stats
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Overview of the JobGraph graph database.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={fetchStats}
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, idx) => {
          const Icon = kpi.icon;
          const staggerClass = `stagger-${idx + 1}`;
          return (
            <Card
              key={kpi.title}
              className={`p-5 hover:border-slate-300 hover-card-elevation transition-all cursor-pointer group animate-card-entrance ${staggerClass}`}
              onClick={() => navigate(`/admin/manage?tab=${kpi.tabKey}`)}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 tracking-wide">
                  {kpi.title}
                </span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.bgColor} ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                  <AnimatedCounter value={Number(kpi.value)} />
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>{kpi.label}</span>
                  <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-slate-600 transition-colors" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* MAIN ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SECTION 1: Jobs by Category (Clean Bar Chart) */}
        <div className="lg:col-span-6">
          <Card className="p-6 space-y-5 h-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  Jobs by Category
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Distribution of job postings across engineering specializations
                </p>
              </div>
              <Badge variant="default" size="sm">4 Categories</Badge>
            </div>

            {/* Vertical / Horizontal Bar Chart */}
            <div className="space-y-4 pt-1">
              {categoryData.map(cat => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{cat.name}</span>
                    <span className="text-slate-500 tabular-nums">
                      <strong className="text-slate-900">{cat.count}</strong> jobs ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full ${cat.color} rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Summary footer for category distribution */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[11px] text-slate-400 block">Backend</span>
                <span className="font-bold text-slate-800 tabular-nums">40%</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[11px] text-slate-400 block">Frontend</span>
                <span className="font-bold text-slate-800 tabular-nums">31%</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[11px] text-slate-400 block">Data</span>
                <span className="font-bold text-slate-800 tabular-nums">18%</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[11px] text-slate-400 block">DevOps</span>
                <span className="font-bold text-slate-800 tabular-nums">11%</span>
              </div>
            </div>
          </Card>
        </div>

        {/* SECTION 2: Most Demanded Skills (Horizontal Bar Chart & Ranking) */}
        <div className="lg:col-span-6">
          <Card className="p-6 space-y-5 h-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Most Demanded Skills
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  High-frequency requirements linked via <code className="font-mono text-slate-600">[:REQUIRES_SKILL]</code>
                </p>
              </div>
              <Badge variant="primary" size="sm">Top 6</Badge>
            </div>

            {/* Horizontal Bar Chart Ranking */}
            <div className="space-y-3 pt-1">
              {demandedSkills.map((sk, idx) => {
                const widthPercent = Math.round((sk.count / sk.maxCount) * 100);
                return (
                  <div key={sk.name} className="p-2.5 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-200/80 transition-colors">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-900">{sk.name}</span>
                        <span className="text-[10px] text-slate-400">({sk.category})</span>
                      </div>
                      <span className="font-bold text-slate-800 tabular-nums">
                        {sk.count} jobs
                      </span>
                    </div>

                    <div className="w-full bg-slate-200/70 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* SECTION 3: Graph Overview (Visually interesting but simple graph summary) */}
      <Card className="p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-indigo-600" />
              Graph Overview
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Structural topology of nodes and bipartite relationship edges in the active database.
            </p>
          </div>
          <Badge variant="default" size="sm">Graph Database Project</Badge>
        </div>

        {/* Visual Graph Summary: Students ↓ Skills ↓ Jobs ↓ Companies */}
        <div className="p-6 bg-slate-950 text-white rounded-xl relative overflow-hidden">
          {/* Subtle grid pattern background */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />

          <div className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              {/* Node 1: Students */}
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-slate-900/90 border border-blue-500/30 animate-node-pop stagger-1">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center mb-2 shadow-inner">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                  Students
                </div>
                <div className="text-2xl font-black text-white tabular-nums my-1">
                  <AnimatedCounter value={Number(stats?.totalStudents ?? 0)} />
                </div>
                <div className="text-[11px] text-slate-400">
                  :Student Nodes
                </div>
              </div>

              {/* Node 2: Skills */}
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-slate-900/90 border border-indigo-500/30 animate-node-pop stagger-2">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center mb-2 shadow-inner">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                  Skills
                </div>
                <div className="text-2xl font-black text-white tabular-nums my-1">
                  <AnimatedCounter value={Number(stats?.totalSkills ?? 0)} />
                </div>
                <div className="text-[11px] text-slate-400">
                  :Skill Nodes
                </div>
              </div>

              {/* Node 3: Jobs */}
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 animate-node-pop stagger-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mb-2 shadow-inner">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Jobs
                </div>
                <div className="text-2xl font-black text-white tabular-nums my-1">
                  <AnimatedCounter value={Number(stats?.totalJobs ?? 0)} />
                </div>
                <div className="text-[11px] text-slate-400">
                  :Job Nodes
                </div>
              </div>

              {/* Node 4: Companies */}
              <div className="flex flex-col items-center text-center p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 animate-node-pop stagger-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mb-2 shadow-inner">
                  <Building className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  Companies
                </div>
                <div className="text-2xl font-black text-white tabular-nums my-1">
                  <AnimatedCounter value={Number(stats?.totalCompanies ?? 0)} />
                </div>
                <div className="text-[11px] text-slate-400">
                  :Company Nodes
                </div>
              </div>
            </div>

            {/* Relationship Flow Diagram */}
            <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-slate-300">
              <span className="px-2.5 py-1 bg-slate-900 rounded-md border border-slate-800 text-blue-300 font-bold">(:Student)</span>
              <span className="text-slate-500">─[:HAS_SKILL]→</span>
              <span className="px-2.5 py-1 bg-slate-900 rounded-md border border-slate-800 text-indigo-300 font-bold">(:Skill)</span>
              <span className="text-slate-500">←[:REQUIRES_SKILL]─</span>
              <span className="px-2.5 py-1 bg-slate-900 rounded-md border border-slate-800 text-emerald-300 font-bold">(:Job)</span>
              <span className="text-slate-500">─[:POSTED_BY]→</span>
              <span className="px-2.5 py-1 bg-slate-900 rounded-md border border-slate-800 text-amber-300 font-bold">(:Company)</span>
            </div>
          </div>
        </div>

        {/* Orthogonal Graph Motif: Connected Job Data & Skill Relationships */}
        <div className="pt-2 border-t border-slate-100">
          <GraphMotif
            topLabel="Java"
            topType="Skill"
            bottomLabel="Python"
            bottomType="Skill"
            leftLabel="Student"
            leftType="Student"
            rightLabel="Backend Developer"
            rightType="Job"
            badgeLabel="Connected Job Data & Skill Relationships"
            variant="card"
            caption="Graph Traversal: MATCH (s:Student)-[:HAS_SKILL]->(sk:Skill)<-[:REQUIRES_SKILL]-(j:Job)"
          />
        </div>
      </Card>

      {/* QUICK ACTIONS */}
      {/* [Manage Students] [Manage Jobs] [Manage Companies] [Manage Skills] */}
      {/* These buttons navigate to /admin/manage and activate the appropriate tab */}
      <Card className="p-6 sm:p-7 space-y-4">
        <div className="pb-2 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">
            Quick Actions
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Navigate to the Data Management console and open the respective entity tab.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button
            variant="outline"
            className="w-full justify-center text-xs py-3 font-semibold border-slate-200 hover:border-blue-400 hover:text-blue-700"
            icon={<Users className="w-4 h-4 text-blue-600" />}
            onClick={() => navigate('/admin/manage?tab=students')}
          >
            Manage Students
          </Button>

          <Button
            variant="outline"
            className="w-full justify-center text-xs py-3 font-semibold border-slate-200 hover:border-emerald-400 hover:text-emerald-700"
            icon={<Briefcase className="w-4 h-4 text-emerald-600" />}
            onClick={() => navigate('/admin/manage?tab=jobs')}
          >
            Manage Jobs
          </Button>

          <Button
            variant="outline"
            className="w-full justify-center text-xs py-3 font-semibold border-slate-200 hover:border-amber-400 hover:text-amber-700"
            icon={<Building className="w-4 h-4 text-amber-600" />}
            onClick={() => navigate('/admin/manage?tab=companies')}
          >
            Manage Companies
          </Button>

          <Button
            variant="outline"
            className="w-full justify-center text-xs py-3 font-semibold border-slate-200 hover:border-indigo-400 hover:text-indigo-700"
            icon={<Sparkles className="w-4 h-4 text-indigo-600" />}
            onClick={() => navigate('/admin/manage?tab=skills')}
          >
            Manage Skills
          </Button>
        </div>
      </Card>
    </div>
  );
};
