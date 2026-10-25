import React from 'react';
import { useRouter } from '../../router/RouterContext';
import { StudentNode } from '../../types/graph';
import { Network, User, Shield, ChevronDown, Sparkles, Menu } from 'lucide-react';
import { Button } from './FormControls';
import { Badge } from './DesignTokens';

export interface NavbarProps {
  students: StudentNode[];
  activeStudentId: string;
  onSelectStudent: (id: string) => void;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  students,
  activeStudentId,
  onSelectStudent,
  onToggleMobileMenu
}) => {
  const { path, role, setRole, navigate } = useRouter();
  const isLanding = path === '/';

  const activeStudent = students.find(s => s.id === activeStudentId) || students[0];

  const handleStudentEntry = () => {
    setRole('student');
    navigate('/dashboard');
  };

  const handleAdminEntry = () => {
    setRole('admin');
    navigate('/admin');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand Zone */}
          <div className="flex items-center gap-3">
            {onToggleMobileMenu && !isLanding && (
              <button
                type="button"
                onClick={onToggleMobileMenu}
                className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={() => navigate('/')}
              className="text-left group flex items-center gap-2.5 focus:outline-none cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Network className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  JOBGRAPH
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs text-slate-400 font-normal">
                  Graph Skill Matcher
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links Zone */}
          {isLanding ? (
            /* Landing Page Top Zone */
            <>
              <nav className="hidden sm:flex items-center gap-8 text-xs font-semibold text-slate-600">
                <a
                  href="#how-it-works"
                  className="hover:text-slate-900 transition-colors"
                >
                  How It Works
                </a>
                <a
                  href="#features"
                  className="hover:text-slate-900 transition-colors"
                >
                  Features
                </a>
              </nav>

              <div className="flex items-center gap-2.5">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleStudentEntry}
                >
                  Student Portal
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAdminEntry}
                >
                  Admin Portal
                </Button>
              </div>
            </>
          ) : role === 'student' ? (
            /* STUDENT NAVIGATION */
            <>
              <nav className="hidden md:flex items-center gap-7 text-xs font-semibold">
                <button
                  onClick={() => navigate('/dashboard')}
                  className={`py-2 relative transition-colors cursor-pointer ${
                    path === '/dashboard' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dashboard
                  {path === '/dashboard' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => navigate('/jobs')}
                  className={`py-2 relative transition-colors cursor-pointer ${
                    path === '/jobs' || path.startsWith('/job/')
                      ? 'text-blue-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Job Matches
                  {(path === '/jobs' || path.startsWith('/job/')) && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => navigate('/skills')}
                  className={`py-2 relative transition-colors cursor-pointer ${
                    path === '/skills' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Skill Improvement
                  {path === '/skills' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className={`py-2 relative transition-colors cursor-pointer ${
                    path === '/profile' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  My Profile
                  {path === '/profile' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              </nav>

              <div className="flex items-center gap-3">
                {/* Switch Student selector */}
                {students.length > 0 && (
                  <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={activeStudentId}
                      onChange={e => onSelectStudent(e.target.value)}
                      className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer pr-1"
                    >
                      {students.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.degree})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Switch to Admin Mode */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAdminEntry}
                  icon={<Shield className="w-3.5 h-3.5 text-slate-500" />}
                >
                  Admin View
                </Button>
              </div>
            </>
          ) : (
            /* ADMIN NAVIGATION */
            <>
              <nav className="hidden md:flex items-center gap-7 text-xs font-semibold">
                <button
                  onClick={() => navigate('/admin')}
                  className={`py-2 relative transition-colors cursor-pointer ${
                    path === '/admin' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Overview &amp; Graph Stats
                  {path === '/admin' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
                <button
                  onClick={() => navigate('/admin/manage')}
                  className={`py-2 relative transition-colors cursor-pointer ${
                    path === '/admin/manage' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Manage Graph Data
                  {path === '/admin/manage' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              </nav>

              <div className="flex items-center gap-3">
                <Badge variant="primary" size="sm" icon={<Shield className="w-3 h-3" />}>
                  Admin Mode
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStudentEntry}
                  icon={<User className="w-3.5 h-3.5 text-slate-500" />}
                >
                  Student View
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
