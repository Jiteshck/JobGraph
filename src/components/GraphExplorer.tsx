import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  StudentNode,
  SkillNode,
  JobNode,
  SkillCategory
} from '../types/graph';
import {
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  Info,
  Share2,
  Code2,
  RefreshCw,
  Eye,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  type: 'Student' | 'Skill' | 'Job';
  category?: SkillCategory;
  radius: number;
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  subtitle?: string;
  isPossessed?: boolean;
}

interface GraphLink {
  source: string;
  target: string;
  label: string;
  type: 'HAS_SKILL' | 'REQUIRES_SKILL';
  importance?: 'MANDATORY' | 'PREFERRED';
  proficiency?: string;
  activePath?: boolean;
}

interface GraphExplorerProps {
  activeStudent: StudentNode;
  students: StudentNode[];
  skills: SkillNode[];
  jobs: JobNode[];
  studentSkills: Array<{ skillId: string; proficiency: string }>;
  jobSkills: Array<{ jobId: string; skillId: string; importance: 'MANDATORY' | 'PREFERRED'; minProficiency: string }>;
  initialJobFilter?: string;
}

export const GraphExplorer: React.FC<GraphExplorerProps> = ({
  activeStudent,
  students,
  skills,
  jobs,
  studentSkills,
  jobSkills,
  initialJobFilter
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [selectedNodeId, setSelectedNodeId] = useState<string>(activeStudent.id);
  const [filterNodeType, setFilterNodeType] = useState<'ALL' | 'STUDENT_SKILL' | 'JOB_SKILL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  // Set of skills possessed by current student
  const possessedSkillIds = useMemo(() => {
    return new Set(studentSkills.map(s => s.skillId));
  }, [studentSkills]);

  // Construct nodes and links
  const { initialNodes, initialLinks } = useMemo(() => {
    const width = 860;
    const height = 560;
    const centerX = width / 2;
    const centerY = height / 2;

    const nodesMap = new Map<string, GraphNode>();

    // Student Node
    nodesMap.set(activeStudent.id, {
      id: activeStudent.id,
      label: activeStudent.name,
      type: 'Student',
      radius: 28,
      color: '#2563EB',
      x: centerX - 260,
      y: centerY,
      vx: 0,
      vy: 0,
      subtitle: `${activeStudent.rollNo} · CGPA ${activeStudent.cgpa}`
    });

    // Skill Nodes (Center column / radial)
    const activeSkillsList = skills.filter(sk => {
      if (selectedCategory !== 'ALL' && sk.category !== selectedCategory) return false;
      return true;
    });

    const totalSkills = activeSkillsList.length;
    activeSkillsList.forEach((skill, idx) => {
      const angle = (idx / totalSkills) * 2 * Math.PI;
      const radiusDist = 130 + (idx % 2) * 50;
      const isPossessed = possessedSkillIds.has(skill.id);

      nodesMap.set(skill.id, {
        id: skill.id,
        label: skill.name,
        type: 'Skill',
        category: skill.category,
        radius: isPossessed ? 18 : 16,
        color: skill.neo4jColor,
        x: centerX + Math.cos(angle) * (radiusDist * 0.7),
        y: centerY + Math.sin(angle) * (radiusDist * 0.9),
        vx: 0,
        vy: 0,
        subtitle: `${skill.category} · ${isPossessed ? 'Acquired' : 'Skill Gap'}`,
        isPossessed
      });
    });

    // Job Nodes (Right column)
    const targetJobs = initialJobFilter 
      ? jobs.filter(j => j.id === initialJobFilter)
      : jobs;

    const totalJobs = targetJobs.length;
    targetJobs.forEach((job, idx) => {
      const spacing = height / (totalJobs + 1);
      nodesMap.set(job.id, {
        id: job.id,
        label: job.title,
        type: 'Job',
        radius: 24,
        color: '#475569',
        x: centerX + 260,
        y: spacing * (idx + 1),
        vx: 0,
        vy: 0,
        subtitle: `${job.company} · Min CGPA ${job.minCgpa}`
      });
    });

    // Links
    const links: GraphLink[] = [];

    // Student -> Skills
    studentSkills.forEach(rel => {
      if (nodesMap.has(rel.skillId)) {
        links.push({
          source: activeStudent.id,
          target: rel.skillId,
          label: 'HAS_SKILL',
          type: 'HAS_SKILL',
          proficiency: rel.proficiency,
          activePath: true
        });
      }
    });

    // Jobs -> Skills
    jobSkills.forEach(rel => {
      if (nodesMap.has(rel.jobId) && nodesMap.has(rel.skillId)) {
        const isMatched = possessedSkillIds.has(rel.skillId);
        links.push({
          source: rel.jobId,
          target: rel.skillId,
          label: 'REQUIRES_SKILL',
          type: 'REQUIRES_SKILL',
          importance: rel.importance,
          proficiency: rel.minProficiency,
          activePath: isMatched
        });
      }
    });

    return {
      initialNodes: Array.from(nodesMap.values()),
      initialLinks: links
    };
  }, [activeStudent, skills, jobs, studentSkills, jobSkills, selectedCategory, initialJobFilter, possessedSkillIds]);

  const [nodes, setNodes] = useState<GraphNode[]>(initialNodes);
  const [links, setLinks] = useState<GraphLink[]>(initialLinks);

  useEffect(() => {
    setNodes(initialNodes);
    setLinks(initialLinks);
  }, [initialNodes, initialLinks]);

  // Selected Node Details
  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  // Connected Neighbors of selected node
  const connectedNodeIds = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const set = new Set<string>();
    set.add(selectedNodeId);

    links.forEach(l => {
      if (l.source === selectedNodeId) set.add(l.target);
      if (l.target === selectedNodeId) set.add(l.source);
    });

    return set;
  }, [selectedNodeId, links]);

  // SVG Mouse handlers for Panning
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.target === svgRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDraggingCanvas) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else if (draggingNodeId) {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mouseX = (e.clientX - rect.left - panOffset.x) / zoomLevel;
      const mouseY = (e.clientY - rect.top - panOffset.y) / zoomLevel;

      setNodes(prev => prev.map(n => n.id === draggingNodeId ? { ...n, x: mouseX, y: mouseY } : n));
    }
  };

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
    setDraggingNodeId(null);
  };

  // Node Drag
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    setDraggingNodeId(nodeId);
  };

  // Helper Cypher query generator for selected node
  const getSelectedNodeCypher = () => {
    if (!selectedNode) return '';
    if (selectedNode.type === 'Student') {
      return `// Inspect Student Node and Adjacent Skills
MATCH (s:Student {id: '${selectedNode.id}'})-[r:HAS_SKILL]->(sk:Skill)
RETURN s.name, r.proficiency, sk.name;`;
    }
    if (selectedNode.type === 'Skill') {
      return `// Inspect Skill Node in Bipartite Graph
MATCH (s:Student)-[h:HAS_SKILL]->(sk:Skill {id: '${selectedNode.id}'})
OPTIONAL MATCH (j:Job)-[req:REQUIRES_SKILL]->(sk)
RETURN count(DISTINCT s) AS studentsWithSkill,
       count(DISTINCT j) AS jobsRequiringSkill;`;
    }
    return `// Inspect Job Requirements
MATCH (j:Job {id: '${selectedNode.id}'})-[r:REQUIRES_SKILL]->(sk:Skill)
RETURN j.title, r.importance, sk.name;`;
  };

  return (
    <div className="space-y-6">
      {/* Visualizer Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Interactive Neo4j Graph Topology Visualizer
            </h2>
            <div className="text-xs text-slate-500 mt-0.5">
              <span>Bipartite Graph: (:Student)-[:HAS_SKILL]-&gt;(:Skill)&lt;-[:REQUIRES_SKILL]-(:Job)</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>{nodes.length} Nodes</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>{links.length} Edges</span>
            </div>
          </div>

          {/* Controls: Zoom and Reset */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setZoomLevel(z => Math.min(z + 0.15, 2))}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(z => Math.max(z - 0.15, 0.5))}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setZoomLevel(1);
                setPanOffset({ x: 0, y: 0 });
              }}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors font-medium"
            >
              Reset View
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {['ALL', 'Languages', 'Frontend', 'Backend', 'Database', 'Cloud & DevOps'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Canvas + Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Graph Canvas Container */}
        <div className="lg:col-span-8 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative shadow-inner">
          {/* Canvas Overlay Legend */}
          <div className="absolute top-3 left-3 z-10 bg-slate-900/90 backdrop-blur-xs border border-slate-800 rounded-lg p-2.5 text-[11px] text-slate-300 space-y-1.5 pointer-events-none">
            <div className="font-semibold text-slate-200 mb-1">Neo4j Node Types</div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
              <span>:Student Node</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span>:Skill Node</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-500 inline-block" />
              <span>:Job Node</span>
            </div>
            <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-400">
              Drag nodes to move · Click to inspect path
            </div>
          </div>

          {/* SVG Viewport */}
          <svg
            ref={svgRef}
            className="w-full h-[540px] cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <defs>
              {/* Arrow Marker for Directed Graph Edges */}
              <marker
                id="arrowhead-active"
                markerWidth="8"
                markerHeight="8"
                refX="18"
                refY="4"
                orient="auto"
              >
                <polygon points="0 0, 8 4, 0 8" fill="#3B82F6" />
              </marker>
              <marker
                id="arrowhead-default"
                markerWidth="8"
                markerHeight="8"
                refX="18"
                refY="4"
                orient="auto"
              >
                <polygon points="0 0, 8 4, 0 8" fill="#475569" />
              </marker>
            </defs>

            <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>
              {/* Render Links */}
              {links.map((link, idx) => {
                const sourceNode = nodes.find(n => n.id === link.source);
                const targetNode = nodes.find(n => n.id === link.target);
                if (!sourceNode || !targetNode) return null;

                const isConnected =
                  link.source === selectedNodeId || link.target === selectedNodeId;

                const strokeColor = isConnected
                  ? '#3B82F6'
                  : link.activePath
                  ? '#10B981'
                  : '#334155';

                const strokeWidth = isConnected ? 2.5 : link.activePath ? 1.5 : 1.0;
                const strokeDasharray = link.importance === 'PREFERRED' ? '4 2' : undefined;

                return (
                  <g key={`${link.source}-${link.target}-${idx}`}>
                    <line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={strokeDasharray}
                      markerEnd={isConnected ? 'url(#arrowhead-active)' : 'url(#arrowhead-default)'}
                      opacity={isConnected ? 1 : 0.6}
                    />
                  </g>
                );
              })}

              {/* Render Nodes */}
              {nodes.map(node => {
                const isSelected = node.id === selectedNodeId;
                const isConnected = connectedNodeIds.has(node.id);

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    className="cursor-pointer"
                    onMouseDown={e => handleNodeMouseDown(e, node.id)}
                  >
                    {/* Node Selection Glow Ring */}
                    {isSelected && (
                      <circle
                        r={node.radius + 6}
                        fill="none"
                        stroke="#60A5FA"
                        strokeWidth="2.5"
                        strokeDasharray="3 3"
                        className="animate-spin"
                        style={{ animationDuration: '8s' }}
                      />
                    )}

                    {/* Main Node Circle */}
                    <circle
                      r={node.radius}
                      fill={node.color}
                      stroke={isSelected ? '#FFFFFF' : '#1E293B'}
                      strokeWidth={isSelected ? 2 : 1}
                      opacity={isSelected || isConnected ? 1 : 0.4}
                      className="transition-all hover:scale-105"
                    />

                    {/* Inner Type Indicator */}
                    <text
                      textAnchor="middle"
                      dy="0.3em"
                      fill="#FFFFFF"
                      fontSize={node.radius > 20 ? '11px' : '9px'}
                      fontWeight="bold"
                      pointerEvents="none"
                    >
                      {node.type === 'Student' ? 'S' : node.type === 'Job' ? 'J' : 'Sk'}
                    </text>

                    {/* Node Label Text */}
                    <text
                      y={node.radius + 14}
                      textAnchor="middle"
                      fill={isSelected ? '#60A5FA' : '#CBD5E1'}
                      fontSize="10px"
                      fontWeight={isSelected ? '600' : '400'}
                      pointerEvents="none"
                      className="tracking-tight"
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Node Inspector Side Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Node Properties Inspector
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                :{selectedNode?.type}
              </span>
            </div>

            {selectedNode ? (
              <div className="space-y-3 text-xs">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedNode.label}
                  </h3>
                  <div className="text-slate-500 mt-0.5">{selectedNode.subtitle}</div>
                </div>

                {/* Node Degree and Neighbor Counts */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg text-center">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Relationship Degree</span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">
                      {connectedNodeIds.size - 1} Edges
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Graph Category</span>
                    <span className="text-sm font-bold text-blue-600 truncate block">
                      {selectedNode.category || selectedNode.type}
                    </span>
                  </div>
                </div>

                {/* Properties Table */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 px-3 py-1.5 font-semibold text-slate-700 text-[11px]">
                    Internal Node Properties (Key-Value)
                  </div>
                  <div className="divide-y divide-slate-100 bg-white">
                    <div className="px-3 py-2 flex justify-between">
                      <span className="text-slate-400 font-mono">id:</span>
                      <span className="font-mono text-slate-800">{selectedNode.id}</span>
                    </div>
                    <div className="px-3 py-2 flex justify-between">
                      <span className="text-slate-400 font-mono">label:</span>
                      <span className="font-medium text-slate-800">{selectedNode.label}</span>
                    </div>
                    {selectedNode.isPossessed !== undefined && (
                      <div className="px-3 py-2 flex justify-between">
                        <span className="text-slate-400 font-mono">studentStatus:</span>
                        <span className={`font-semibold ${selectedNode.isPossessed ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {selectedNode.isPossessed ? 'Acquired (:HAS_SKILL)' : 'Missing Gap'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dynamic Cypher Pattern for this node */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-[11px]">
                    <Code2 className="w-3.5 h-3.5 text-slate-500" />
                    Neighborhood Query
                  </div>
                  <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg text-[10px] font-mono overflow-x-auto leading-relaxed">
                    {getSelectedNodeCypher()}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400">
                Click any node on the graph canvas to inspect its properties.
              </div>
            )}
          </div>

          {/* Academic Traversal Note */}
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
            <span className="font-semibold block text-blue-950">
              Graph Property Model (Neo4j):
            </span>
            <p className="text-blue-800">
              In Neo4j, edges are first-class entities with their own labels and properties (such as <code className="bg-blue-100 px-1 py-0.5 rounded text-[11px]">importance</code> and <code className="bg-blue-100 px-1 py-0.5 rounded text-[11px]">proficiency</code>). This allows fine-grained traversal queries with zero join overhead.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
