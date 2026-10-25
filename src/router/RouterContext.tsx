import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'student' | 'admin';

interface RouterContextType {
  path: string;
  search: string;
  params: Record<string, string>;
  role: UserRole;
  setRole: (role: UserRole) => void;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

function matchRoute(currentPath: string, pattern: string): { match: boolean; params: Record<string, string> } {
  const currentParts = currentPath.split('?')[0].split('/').filter(Boolean);
  const patternParts = pattern.split('?')[0].split('/').filter(Boolean);

  if (currentParts.length !== patternParts.length) {
    return { match: false, params: {} };
  }

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      const paramName = patternParts[i].slice(1);
      params[paramName] = currentParts[i];
    } else if (patternParts[i] !== currentParts[i]) {
      return { match: false, params: {} };
    }
  }

  return { match: true, params };
}

export const RouterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [path, setPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [search, setSearch] = useState<string>(() => {
    return window.location.search || '';
  });

  // Infer initial role from path or default to 'student'
  const [role, setRole] = useState<UserRole>(() => {
    const current = window.location.pathname || '/';
    if (current.startsWith('/admin')) return 'admin';
    return 'student';
  });

  useEffect(() => {
    const handlePopState = () => {
      const newPath = window.location.pathname || '/';
      setPath(newPath);
      setSearch(window.location.search || '');
      if (newPath.startsWith('/admin')) {
        setRole('admin');
      } else if (newPath !== '/') {
        setRole('student');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    const [targetPath, targetSearch = ''] = to.split('?');
    const fullTarget = targetSearch ? `${targetPath}?${targetSearch}` : targetPath;

    if (fullTarget !== (search ? `${path}${search}` : path)) {
      window.history.pushState({}, '', fullTarget);
      setPath(targetPath);
      setSearch(targetSearch ? `?${targetSearch}` : '');
      if (targetPath.startsWith('/admin')) {
        setRole('admin');
      } else if (targetPath !== '/') {
        setRole('student');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Extract params for parameterized routes
  let extractedParams: Record<string, string> = {};
  const jobMatch = matchRoute(path, '/job/:id');
  if (jobMatch.match) {
    extractedParams = jobMatch.params;
  }

  return (
    <RouterContext.Provider value={{ path, search, params: extractedParams, role, setRole, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = (): RouterContextType => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};
