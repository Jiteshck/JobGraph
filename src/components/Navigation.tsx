import React from 'react';
import { useRouter } from '../router/RouterContext';
import { useAuth } from '../context/AuthContext';
import { StudentNode } from '../types/graph';
import { Network, User, Shield, ChevronDown, Sparkles, LogOut, LogIn, UserPlus } from 'lucide-react';
import { Button, Badge } from './design-system/DesignTokens';
import { ApiIntegrationBadge } from './design-system/ApiIntegrationBadge';

interface NavigationProps {
  students: StudentNode[];
  activeStudentId: string;
  onSelectStudent: (id: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  students,
  activeStudentId,
  onSelectStudent
}) => {
  const { path, role, setRole, navigate } = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const isLanding = path === '/';

  const activeStudent = students.find(s => s.id === activeStudentId) || students[0];

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand Zone */}
          <div className="flex items-center gap-3">
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
            <div className="hidden lg:block">
              <ApiIntegrationBadge />
            </div>
          </div>

          {/* Navigation Links Zone */}
          {isLanding || !isAuthenticated ? (
            /* Unauthenticated / Landing Page Top Zone */
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
                {isAuthenticated && user ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(user.role === 'admin' ? '/admin' : '/dashboard')}
                      className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      Go to {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                    </button>
                    <button
                      onClick={handleLogout}
                      title="Log Out"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<LogIn className="w-3.5 h-3.5" />}
                      onClick={handleLoginClick}
                    >
                      Log In
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<UserPlus className="w-3.5 h-3.5" />}
                      onClick={handleSignupClick}
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </>
          ) : role === 'student' ? (
            /* AUTHENTICATED STUDENT NAVIGATION */
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
                  Jobs
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
                  Skills
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
                  Profile
                  {path === '/profile' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              </nav>

              {/* Logged-in User Account Profile & Log Out */}
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-lg px-2.5 py-1 text-xs">
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                    {user?.name ? user.name[0].toUpperCase() : 'S'}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-slate-800 text-[11px] truncate max-w-[130px] sm:max-w-[160px]">
                      {user?.name || activeStudent?.name || 'Student'}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono -mt-0.5">
                      Student Account
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Log Out"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            /* AUTHENTICATED ADMIN NAVIGATION */
            <>
              <nav className="hidden md:flex items-center gap-7 text-xs font-semibold">
                <button
                  onClick={() => navigate('/admin')}
                  className={`py-2 relative transition-colors cursor-pointer ${
                    path === '/admin' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dashboard
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
                  Manage Data
                  {path === '/admin/manage' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              </nav>

              <div className="flex items-center gap-2.5">
                <Badge variant="primary" icon={<Shield className="w-3 h-3" />}>
                  Admin: {user?.name || 'Administrator'}
                </Badge>
                <button
                  onClick={handleLogout}
                  title="Log Out"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mobile Subnav for Student or Admin */}
        {!isLanding && isAuthenticated && (
          <div className="md:hidden flex items-center gap-3 overflow-x-auto py-2.5 border-t border-slate-100 text-xs">
            {role === 'student' ? (
              <>
                <button
                  onClick={() => navigate('/dashboard')}
                  className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap cursor-pointer ${
                    path === '/dashboard' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/jobs')}
                  className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap cursor-pointer ${
                    path === '/jobs' || path.startsWith('/job/') ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Jobs
                </button>
                <button
                  onClick={() => navigate('/skills')}
                  className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap cursor-pointer ${
                    path === '/skills' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Skills
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap cursor-pointer ${
                    path === '/profile' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Profile
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/admin')}
                  className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap cursor-pointer ${
                    path === '/admin' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/admin/manage')}
                  className={`px-3 py-1.5 rounded-md font-semibold whitespace-nowrap cursor-pointer ${
                    path === '/admin/manage' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Manage Data
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
