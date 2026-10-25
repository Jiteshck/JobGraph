import React from 'react';
import { X, Network, BookOpen, Layers, CheckCircle2, Database, Server } from 'lucide-react';

interface AcademicSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AcademicSchemaModal: React.FC<AcademicSchemaModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl my-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                JOBGRAPH Academic Architecture & Graph Schema Documentation
              </h3>
              <p className="text-xs text-slate-500">
                BCA College Final Year Project Specification · Neo4j Property Graph Model
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-600 leading-relaxed">
          {/* Section 1: Property Graph Schema */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              1. Labeled Property Graph (LPG) Schema
            </h4>
            <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] leading-loose overflow-x-auto border border-slate-800">
              <div className="text-blue-400 font-bold mb-1">// Entity Node Definitions:</div>
              <div>(:Student &#123;id, name, rollNo, degree, semester, cgpa, targetRole, email&#125;)</div>
              <div>(:Skill   &#123;id, name, category, description, marketDemand, color&#125;)</div>
              <div>(:Job     &#123;id, title, company, experienceLevel, department, minCgpa&#125;)</div>
              <br />
              <div className="text-emerald-400 font-bold mb-1">// Directed Relationship Edges:</div>
              <div>(:Student)-[:HAS_SKILL &#123;proficiency, verified, acquiredDate&#125;]-&gt;(:Skill)</div>
              <div>(:Job)-[:REQUIRES_SKILL &#123;importance: 'MANDATORY'|'PREFERRED', minProficiency&#125;]-&gt;(:Skill)</div>
              <div>(:Skill)-[:SYNERGY_WITH &#123;weight: 0.0..1.0, reason&#125;]-&gt;(:Skill)</div>
            </div>
          </div>

          {/* Section 2: Mathematical Match Formulations */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              2. Graph Overlap & Skill Gap Mathematical Formulations
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                <span className="font-bold text-slate-900 block">Graph Match Percentage:</span>
                <p className="font-mono text-[11px] text-blue-700 bg-white p-1.5 rounded border border-slate-200">
                  Overlap(S, J) = (|S ∩ J| / |J|) × 100%
                </p>
                <p className="text-[11px] text-slate-500">
                  Where S represents the student's possessed skill set and J represents the required job skill set.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                <span className="font-bold text-slate-900 block">Skill Gap Set Difference:</span>
                <p className="font-mono text-[11px] text-rose-700 bg-white p-1.5 rounded border border-slate-200">
                  Gap(S, J) = J \ S = &#123; sk ∈ J | sk ∉ S &#125;
                </p>
                <p className="text-[11px] text-slate-500">
                  Evaluated with Neo4j subquery: <code className="font-mono">WHERE NOT EXISTS &#123; MATCH (s)-[:HAS_SKILL]-&gt;(sk) &#125;</code>.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Technical Stack Architecture */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-600" />
              3. Technology Stack & Backend REST Integration
            </h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
                  <tr>
                    <th className="p-2.5">Layer</th>
                    <th className="p-2.5">Technology</th>
                    <th className="p-2.5">Responsibility in BCA Project</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-900">Database</td>
                    <td className="p-2.5 font-mono text-blue-700">Neo4j 5.x / Cypher</td>
                    <td className="p-2.5 text-slate-600">Property graph storage, index-free adjacency traversal</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-900">Backend API</td>
                    <td className="p-2.5 font-mono text-emerald-700">Node.js + Express.js</td>
                    <td className="p-2.5 text-slate-600">REST endpoints, neo4j-driver Bolt connection pool</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-900">Frontend UI</td>
                    <td className="p-2.5 font-mono text-indigo-700">React + TypeScript</td>
                    <td className="p-2.5 text-slate-600">Interactive topology visualizer, match engine, viva console</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-semibold text-slate-900">Styling</td>
                    <td className="p-2.5 font-mono text-sky-700">Tailwind CSS</td>
                    <td className="p-2.5 text-slate-600">Responsive, accessible desktop & mobile presentation layout</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Why Graph DB over SQL (Examiner Viva Answer) */}
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5">
            <span className="font-bold text-blue-950 block">Key Viva Defense Argument:</span>
            <p className="text-blue-900">
              "In standard relational databases (RDBMS), calculating skill matches requires 3 to 4 join tables, resulting in Cartesian explosion and slow join execution plans. By using Neo4j's graph database with index-free adjacency, each node directly points to its neighboring skill relationships in RAM. This reduces graph traversal time from O(N²) join checks down to O(deg(node)) pointer traversals, making skill gap analysis fast and scalable."
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">JOBGRAPH v1.0 · Academic Release</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
