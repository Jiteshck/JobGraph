import React from 'react';
import { useRouter } from '../../router/RouterContext';
import {
  Network,
  LayoutDashboard,
  Briefcase,
  Sparkles,
  User,
  Shield,
  Layers,
  Database,
  ChevronRight,
  X
} from 'lucide-react';

export interface SidebarItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export interface SidebarProps {
  title?: string;
  items?: SidebarItem[];
  collapsed?: boolean;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  title = 'Navigation',
  items,
  collapsed = false,
  isOpenMobile = false,
  onCloseMobile,
  className = ''
}) => {
  const { path, navigate, role } = useRouter();

  const defaultItems: SidebarItem[] =
    role === 'admin'
      ? [
          {
            id: 'admin-dash',
            label: 'Overview & Graph Stats',
            path: '/admin',
            icon: <LayoutDashboard className="w-4 h-4" />
          },
          {
            id: 'admin-manage',
            label: 'Manage Graph Data',
            path: '/admin/manage',
            icon: <Database className="w-4 h-4" />
          }
        ]
      : [
          {
            id: 'student-dash',
            label: 'Dashboard',
            path: '/dashboard',
            icon: <LayoutDashboard className="w-4 h-4" />
          },
          {
            id: 'student-jobs',
            label: 'Job Matches',
            path: '/jobs',
            icon: <Briefcase className="w-4 h-4" />
          },
          {
            id: 'student-skills',
            label: 'Skill Improvement',
            path: '/skills',
            icon: <Sparkles className="w-4 h-4" />
          },
          {
            id: 'student-profile',
            label: 'My Profile',
            path: '/profile',
            icon: <User className="w-4 h-4" />
          }
        ];

  const navItems = items || defaultItems;

  const content = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-64 p-4">
      {/* Mobile close button */}
      <div className="flex md:hidden items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          {title}
        </span>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
        {title}
      </div>

      <nav className="space-y-1 flex-1">
        {navItems.map(item => {
          const isActive = path === item.path || (item.path !== '/' && path.startsWith(item.path));
          return (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.path);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Database Node Legend badge */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mt-4">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          Neo4j Graph Database
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 text-blue-700">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>:Student</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>:Skill</span>
          </div>
          <div className="flex items-center gap-1.5 text-purple-700">
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            <span>:Job</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-700">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            <span>:Company</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className={`hidden md:block shrink-0 ${className}`}>
        {content}
      </aside>

      {/* Mobile drawer backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-2xs flex md:hidden"
          onClick={e => {
            if (e.target === e.currentTarget && onCloseMobile) {
              onCloseMobile();
            }
          }}
        >
          <div className="w-72 bg-white h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
