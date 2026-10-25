import React from 'react';
import { StudentNode } from '../types/graph';
import { Network, BookOpen, User, Sliders } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  students: StudentNode[];
  activeStudentId: string;
  onSelectStudent: (studentId: string) => void;
  onOpenSchemaModal: () => void;
  showTestingPanel: boolean;
  onToggleTestingPanel: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  students,
  activeStudentId,
  onSelectStudent,
  onOpenSchemaModal,
  showTestingPanel,
  onToggleTestingPanel
}) => {
  const activeStudent = students.find(s => s.id === activeStudentId) || students[0];

  const navItems = [
    { id: 'pipeline', label: 'Concept Pipeline' },
    { id: 'matches', label: 'Match & Gap Engine' },
    { id: 'graph', label: 'Graph Explorer' },
    { id: 'bridge', label: 'Recommended Skills' },
    { id: 'cypher', label: 'Cypher Console' },
    { id: 'students', label: 'Student Profiles' },
    { id: 'jobs', label: 'Job Roles' },
    { id: 'design-system', label: 'Design System' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Brand title wordmark (single text element as per contract) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onTabChange('pipeline')}
              className="text-left group flex items-center gap-2.5 focus:outline-none"
            >
              <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Network className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  JOBGRAPH
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs text-slate-400 font-normal">
                  Neo4j Skill Matcher
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 4-7 text navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium">
            {navItems.map(item => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`relative py-2 whitespace-nowrap transition-colors ${
                    isActive
                      ? 'text-blue-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-2.5">
            {/* Student Switcher dropdown */}
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
              <User className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
              <label htmlFor="student-select" className="sr-only">Select Student</label>
              <select
                id="student-select"
                value={activeStudentId}
                onChange={e => onSelectStudent(e.target.value)}
                className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer pr-1 text-xs truncate max-w-[150px] sm:max-w-[190px]"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.rollNo})
                  </option>
                ))}
              </select>
            </div>

            {/* Academic Schema / Viva Info Button */}
            <button
              onClick={onOpenSchemaModal}
              title="View Academic Property Graph Schema & Project Info"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            {/* Presentation State Testing Toggle */}
            <button
              onClick={onToggleTestingPanel}
              title="Toggle Academic Presentation & State Testing Panel"
              className={`p-2 rounded-lg transition-colors ${
                showTestingPanel
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto py-2.5 border-t border-slate-100 scrollbar-none text-xs">
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
