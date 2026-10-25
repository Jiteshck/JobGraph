import React, { useState, useEffect } from 'react';
import { jobGraphApi, ApiLogEntry } from '../../services/jobGraphApi';
import {
  Server,
  Database,
  ArrowRight,
  Code2,
  CheckCircle2,
  Layers,
  ChevronDown,
  ChevronUp,
  Activity,
  Terminal,
  ExternalLink
} from 'lucide-react';
import { Modal } from './Overlays';

interface ApiIntegrationBadgeProps {
  className?: string;
  showDetailsModalOnClick?: boolean;
}

export const ApiIntegrationBadge: React.FC<ApiIntegrationBadgeProps> = ({
  className = '',
  showDetailsModalOnClick = true
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logs, setLogs] = useState<ApiLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'endpoints' | 'architecture' | 'logs'>('endpoints');

  useEffect(() => {
    const unsubscribe = jobGraphApi.subscribeLogs(newLogs => {
      setLogs(newLogs);
    });
    return () => unsubscribe();
  }, []);

  const endpoints = [
    {
      method: 'GET',
      path: '/api/jobs',
      desc: 'List all jobs with requirements from Neo4j',
      cypher: 'MATCH (j:Job)-[:REQUIRES_SKILL]->(s:Skill) RETURN j, collect(s)'
    },
    {
      method: 'GET',
      path: '/api/jobs/:id',
      desc: 'Get job detail + match breakdown for active student',
      cypher: 'MATCH (j:Job {id: $id}) OPTIONAL MATCH (j)-[r:REQUIRES_SKILL]->(s:Skill) RETURN j, s, r'
    },
    {
      method: 'GET',
      path: '/api/students/:id',
      desc: 'Fetch student node properties & enrolled skills',
      cypher: 'MATCH (st:Student {id: $id})-[r:HAS_SKILL]->(s:Skill) RETURN st, s, r'
    },
    {
      method: 'POST',
      path: '/api/students',
      desc: 'Create new student node & HAS_SKILL relationships in Neo4j',
      cypher: 'CREATE (st:Student $props) WITH st UNWIND $skills AS sk CREATE (st)-[:HAS_SKILL]->(s)'
    },
    {
      method: 'PUT',
      path: '/api/students/:id',
      desc: 'Update student properties & synchronize skills',
      cypher: 'MATCH (st:Student {id: $id}) SET st += $props ...'
    },
    {
      method: 'GET',
      path: '/api/students/:id/matches',
      desc: 'Graph-computed overlap score (|Matched| / |Total Required| * 100)',
      cypher: 'MATCH (st:Student {id: $id})-[:HAS_SKILL]->(s:Skill)<-[:REQUIRES_SKILL]-(j:Job) ...'
    },
    {
      method: 'GET',
      path: '/api/students/:id/skill-gaps',
      desc: 'Identifies missing skills across target jobs & high-gain bridge skills',
      cypher: 'MATCH (j:Job)-[:REQUIRES_SKILL]->(s:Skill) WHERE NOT (st)-[:HAS_SKILL]->(s) ...'
    },
    {
      method: 'GET',
      path: '/api/skills/recommended',
      desc: 'Bridge skills derived from student skills + job required skills + graph relations',
      cypher: 'MATCH (st)-[:HAS_SKILL]->(s1)-[:SYNERGY_WITH]-(s2)<-[:REQUIRES_SKILL]-(j:Job) ...'
    },
    {
      method: 'GET',
      path: '/api/admin/stats',
      desc: 'Aggregated Neo4j node counts, edge counts, and market demand stats',
      cypher: 'MATCH (s:Student), (j:Job), (c:Company), (sk:Skill) RETURN count(distinct ...)'
    }
  ];

  return (
    <>
      <button
        onClick={() => showDetailsModalOnClick && setIsModalOpen(true)}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80 transition-colors cursor-pointer ${className}`}
        title="View Express API Architecture & Neo4j Integration"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-mono text-[10px] text-slate-500">Express API</span>
        <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
        <span className="font-mono text-[10px] text-blue-600">Neo4j Driver</span>
      </button>

      {/* Modal with Full Architecture & Endpoints Breakdown */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 block">Frontend &rarr; Express API &rarr; Neo4j Architecture</span>
              <span className="text-xs font-normal text-slate-500 block">Decoupled RESTful system designed for academic graph queries</span>
            </div>
          </div>
        }
        maxWidth="3xl"
      >
        <div className="space-y-4">
          {/* Architecture Visual Diagram */}
          <div className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs shadow-inner">
            <div className="text-slate-400 text-[11px] mb-2.5 font-sans font-semibold uppercase tracking-wider">
              Data Flow Architecture
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-2.5 text-center py-2">
              <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                <div className="text-emerald-400 font-bold text-xs">Frontend (React SPA)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Vite · Tailwind · Components</div>
              </div>

              <div className="flex flex-col items-center justify-center text-slate-400 text-[10px] font-sans py-1">
                <span className="text-blue-400 font-bold">&rarr; HTTP Requests</span>
                <span className="text-slate-500">JSON Payload</span>
              </div>

              <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                <div className="text-amber-400 font-bold text-xs">Express API (Node.js)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">REST Endpoints &amp; Logic</div>
              </div>

              <div className="flex flex-col items-center justify-center text-slate-400 text-[10px] font-sans py-1">
                <span className="text-emerald-400 font-bold">&rarr; Bolt Protocol</span>
                <span className="text-slate-500">Cypher Queries</span>
              </div>

              <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                <div className="text-blue-400 font-bold text-xs">Neo4j Driver &amp; DB</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Graph Nodes &amp; Edges</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-sans leading-relaxed">
              <span className="text-emerald-400 font-semibold">&bull; Graph-Grounded Logic:</span> All recommendations conceptually derive strictly from:
              <span className="text-white font-medium ml-1">Student Skills</span> +
              <span className="text-white font-medium ml-1">Job Required Skills</span> +
              <span className="text-white font-medium ml-1">Graph Traversal Relationships</span>.
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('endpoints')}
              className={`px-3 py-1.5 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
                activeTab === 'endpoints'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              REST Endpoints ({endpoints.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 text-xs font-semibold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'logs'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Live API Calls ({logs.length})</span>
            </button>
          </div>

          {/* Tab 1: Endpoints */}
          {activeTab === 'endpoints' && (
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {endpoints.map((ep, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                          ep.method === 'GET'
                            ? 'bg-blue-100 text-blue-700'
                            : ep.method === 'POST'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {ep.method}
                      </span>
                      <span className="font-mono font-semibold text-slate-900 text-xs">
                        {ep.path}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600">{ep.desc}</p>
                  <div className="p-1.5 bg-slate-900 text-slate-300 font-mono text-[10px] rounded overflow-x-auto">
                    <span className="text-slate-500">// Conceptual Neo4j Cypher:</span>
                    <br />
                    {ep.cypher}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Logs */}
          {activeTab === 'logs' && (
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No API calls logged yet. Navigate through the app to generate requests.
                </div>
              ) : (
                logs.map(log => (
                  <div
                    key={log.id}
                    className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 font-mono">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          log.method === 'GET'
                            ? 'bg-blue-100 text-blue-700'
                            : log.method === 'POST'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {log.method}
                      </span>
                      <span className="text-slate-800 font-semibold">{log.endpoint}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="text-emerald-600 font-mono font-medium">{log.latencyMs}ms</span>
                      <span className="text-slate-400">{log.timestamp}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};
