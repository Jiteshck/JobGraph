import React, { useState } from 'react';
import { CYPHER_QUERIES } from '../data/mockDatabase';
import { CypherQueryTemplate, StudentNode } from '../types/graph';
import { graphDb } from '../services/apiClient';
import {
  Terminal,
  Play,
  Copy,
  Check,
  Clock,
  Layers,
  HelpCircle,
  FileText,
  AlertCircle
} from 'lucide-react';

interface CypherConsoleProps {
  activeStudent: StudentNode;
}

export const CypherConsole: React.FC<CypherConsoleProps> = ({ activeStudent }) => {
  const [selectedQueryId, setSelectedQueryId] = useState<string>(CYPHER_QUERIES[0].id);
  const [copied, setCopied] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [results, setResults] = useState<{
    columns: string[];
    rows: any[];
    executionTimeMs: number;
    recordsReturned: number;
    nodesTraversed: number;
  } | null>(null);
  const [activeVivaAccordion, setActiveVivaAccordion] = useState<number | null>(0);

  const currentTemplate =
    CYPHER_QUERIES.find(q => q.id === selectedQueryId) || CYPHER_QUERIES[0];

  const handleRunQuery = async () => {
    setIsRunning(true);
    try {
      const res = await graphDb.executeCypher(selectedQueryId, {
        studentId: activeStudent.id,
        jobId: 'job-1'
      });
      setResults(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyQuery = () => {
    navigator.clipboard.writeText(currentTemplate.query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const vivaQuestions = [
    {
      q: 'Why use Neo4j Graph DB over Relational SQL for Job-Skill matching?',
      a: 'In SQL, calculating skill overlaps between students and jobs requires joining 4 tables (Students ⋈ Student_Skills ⋈ Job_Skills ⋈ Jobs) with complex GROUP BY and HAVING clauses. In relational systems, JOIN operations scale quadratically as table sizes increase. Neo4j uses Index-Free Adjacency: each node holds direct physical memory pointers to adjacent relationships, executing path traversals in O(degree) time regardless of overall database volume.'
    },
    {
      q: 'How does JOBGRAPH calculate the Skill Match Percentage in Cypher?',
      a: 'The system matches the path (s:Student)-[:HAS_SKILL]->(sk:Skill)<-[:REQUIRES_SKILL]-(j:Job), counts the intersection of shared skill nodes, and divides by the total required skills on the job: round((toFloat(matchedSkillCount) / totalRequiredCount) * 100, 1).'
    },
    {
      q: 'How does the Cypher query discover the Missing Skills (Gap Set)?',
      a: 'The query evaluates Job requirements (j)-[:REQUIRES_SKILL]->(sk:Skill) and uses the pattern comprehension filter WHERE NOT EXISTS { MATCH (s:Student)-[:HAS_SKILL]->(sk) } to extract the exact set difference: RequiredSkills \\ StudentSkills.'
    },
    {
      q: 'What is a Bridge Skill and how does the graph identify it?',
      a: 'A Bridge Skill is a missing skill node that has the highest degree centrality to multiple target job nodes. By executing a 2-hop traversal from the student to missing skills and aggregating distinct jobs requiring that skill, the query ranks candidate skills by total career unlock potential.'
    },
    {
      q: 'How does the Frontend communicate with Neo4j? Does it query Neo4j directly?',
      a: 'No. The frontend (HTML/CSS/JS/React) never connects directly to Neo4j. It sends standard JSON HTTP requests to an Express.js (Node.js) REST API (e.g. GET /api/jobs, GET /api/students/:id/matches, GET /api/students/:id/skill-gaps, GET /api/skills/recommended, GET /api/admin/stats). The Express server utilizes the official neo4j-driver to execute parameterized Cypher queries over bolt:// protocol and returns sanitized JSON payloads to the frontend.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Console Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
              <Terminal className="w-4 h-4" />
              Academic Neo4j & Cypher Query Engine
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Cypher Graph Query Inspector & Execution Console
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Inspect and execute actual Cypher graph patterns used by the Express backend for student <strong>{activeStudent.name}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyQuery}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-colors inline-flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied to Clipboard' : 'Copy Cypher'}
            </button>
            <button
              onClick={handleRunQuery}
              disabled={isRunning}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {isRunning ? 'Executing...' : 'Run Query'}
            </button>
          </div>
        </div>

        {/* Query Template Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-4 mt-4 border-t border-slate-100 scrollbar-none text-xs">
          {CYPHER_QUERIES.map(q => {
            const isSelected = selectedQueryId === q.id;
            return (
              <button
                key={q.id}
                onClick={() => {
                  setSelectedQueryId(q.id);
                  setResults(null);
                }}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-slate-900 text-white font-medium'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {q.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Query Code Display & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Cypher Code Editor Frame */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-xs">
            {/* Terminal Top Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                <span className="font-mono text-slate-400 ml-2 text-[11px]">
                  neo4j-console · {currentTemplate.category}
                </span>
              </div>
              <span className="font-mono text-[11px] text-blue-400">
                {currentTemplate.complexity}
              </span>
            </div>

            {/* Code */}
            <div className="p-4 overflow-x-auto font-mono text-xs leading-relaxed text-slate-100">
              <pre className="text-emerald-400 select-all">{currentTemplate.query}</pre>
            </div>
          </div>

          {/* Academic Notes Card */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" />
              Academic Analysis & Performance Characteristics
            </h4>
            <p className="text-slate-600 leading-relaxed">
              {currentTemplate.academicNotes}
            </p>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-400 text-[11px]">
              <span>Param: $studentId = '{activeStudent.id}'</span>
              <span>Algorithm Complexity: {currentTemplate.complexity}</span>
            </div>
          </div>
        </div>

        {/* Right: Live Execution Results Table */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
              <span className="font-bold text-slate-900">
                Execution Results & Record Set
              </span>
              {results ? (
                <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    {results.executionTimeMs}ms
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="w-3 h-3 text-blue-600" />
                    {results.recordsReturned} records
                  </span>
                </div>
              ) : (
                <span className="text-slate-400 text-[11px]">Pending execution</span>
              )}
            </div>

            {results ? (
              <div className="space-y-3">
                <div className="border border-slate-200 rounded-lg overflow-x-auto max-h-72 text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono text-[11px]">
                      <tr>
                        {results.columns.map(col => (
                          <th key={col} className="p-2.5 whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {results.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50/70">
                          {results.columns.map(col => (
                            <td key={col} className="p-2.5 whitespace-nowrap font-medium text-slate-800">
                              {String(row[col] ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Graph Traversal Engine: Bolt Protocol (simulated)</span>
                  <span className="font-medium text-emerald-600">Status 200 OK</span>
                </div>
              </div>
            ) : (
              <div className="py-12 px-4 text-center space-y-3">
                <Play className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">
                  Click <strong>Run Query</strong> above to simulate Cypher execution against the current graph model.
                </p>
                <button
                  onClick={handleRunQuery}
                  className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                >
                  Execute with active student parameters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* College Project Viva / Defense FAQ Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">
            BCA Academic Viva Examination Questions & Answers
          </h3>
        </div>

        <div className="space-y-3">
          {vivaQuestions.map((item, idx) => {
            const isOpen = activeVivaAccordion === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 rounded-lg overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveVivaAccordion(isOpen ? null : idx)}
                  className="w-full text-left p-3.5 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-900 transition-colors"
                >
                  <span>Q{idx + 1}: {item.q}</span>
                  <span className="text-slate-400 font-mono text-sm ml-2">
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                {isOpen && (
                  <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-200">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
