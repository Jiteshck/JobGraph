import React, { useState } from 'react';
import { useRouter } from '../router/RouterContext';
import { useAuth } from '../context/AuthContext';
import {
  Network,
  Mail,
  Lock,
  User,
  ArrowRight,
  Shield,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button, Card, Input } from '../components/design-system';
import { BrandedLoadingScreen } from '../components/design-system/BrandedLoadingScreen';

interface AuthPageProps {
  initialMode?: 'login' | 'signup';
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login' }) => {
  const { navigate, setRole } = useRouter();
  const { login, signup, loginWithGoogle, signupWithGoogle } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Loading animation state after successful login or signup
  const [loadingTransition, setLoadingTransition] = useState<{
    subtitle: string;
    targetRole: 'student' | 'admin';
    targetPath: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please provide an email address.');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.success && res.user) {
          setLoadingTransition({
            subtitle: res.user.role === 'admin'
              ? 'Authenticating administrator workspace...'
              : 'Authenticating student profile & skills graph...',
            targetRole: res.user.role,
            targetPath: res.user.role === 'admin' ? '/admin' : '/dashboard'
          });
        } else {
          setError(res.error || 'Failed to sign in.');
        }
      } else {
        const res = await signup({
          name,
          email,
          password,
          role: 'student',
          rollNo
        });
        if (res.success && res.user) {
          setLoadingTransition({
            subtitle: 'Setting up student graph profile & career matching...',
            targetRole: 'student',
            targetPath: '/dashboard'
          });
        } else {
          setError(res.error || 'Failed to create student account.');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setIsLoading(true);
    try {
      if (mode === 'login') {
        const res = await loginWithGoogle();
        if (res.success && res.user) {
          setLoadingTransition({
            subtitle: res.user.role === 'admin'
              ? 'Verified with Google. Opening administrator panel...'
              : 'Verified with Google. Loading student dashboard...',
            targetRole: res.user.role,
            targetPath: res.user.role === 'admin' ? '/admin' : '/dashboard'
          });
        } else {
          setError(res.error || 'Google sign-in failed.');
        }
      } else {
        const res = await signupWithGoogle('student');
        if (res.success && res.user) {
          setLoadingTransition({
            subtitle: 'Google account linked. Initializing student graph record...',
            targetRole: 'student',
            targetPath: '/dashboard'
          });
        } else {
          setError(res.error || 'Google sign-up failed.');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Google authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Branded loading animation window shown after login / signup */}
      {loadingTransition && (
        <BrandedLoadingScreen
          minDuration={900}
          ready={true}
          title="JOBGRAPH"
          subtitle={loadingTransition.subtitle}
          onComplete={() => {
            setRole(loadingTransition.targetRole);
            navigate(loadingTransition.targetPath);
          }}
        />
      )}

      {/* Perfectly Centered Container For All Screen Types */}
      <div className="w-full flex-1 flex flex-col items-center justify-center my-auto py-4 sm:py-8 px-4 sm:px-6">
        <div className="w-full max-w-md mx-auto">
          <Card className="w-full p-5 sm:p-8 bg-white border border-slate-200/90 rounded-2xl shadow-sm space-y-4 sm:space-y-5">
            {/* Brand Header */}
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-blue-600 text-white shadow-xs mb-1">
                <Network className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {mode === 'login' ? 'Welcome back to JobGraph' : 'Create Student Account'}
              </h1>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {mode === 'login'
                  ? 'Sign in to access your graph-matched career dashboard or admin controls.'
                  : 'Register as a student to map your skills with job requirements via graph data.'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error message banner */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Google Authentication Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading || !!loadingTransition}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-medium text-xs sm:text-sm shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {/* Official Google 'G' Logo SVG */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>
                {mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}
              </span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider absolute">
                Or with email
              </span>
            </div>

            {/* Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Roll Number / Student ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BCA-2024-001"
                    value={rollNo}
                    onChange={e => setRollNo(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full justify-center shadow-xs pt-2"
                disabled={isLoading || !!loadingTransition}
              >
                {isLoading || loadingTransition ? (
                  <span>Authenticating...</span>
                ) : mode === 'login' ? (
                  <span className="flex items-center gap-1.5">
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
};
