import React, { useEffect, useState } from 'react';

interface BrandedLoadingScreenProps {
  onComplete?: () => void;
  minDuration?: number; // small duration in ms, default 600ms
  ready?: boolean;
  title?: string;
  subtitle?: string;
}

export const BrandedLoadingScreen: React.FC<BrandedLoadingScreenProps> = ({
  onComplete,
  minDuration = 600,
  ready = true,
  title = 'JOBGRAPH',
  subtitle = 'Connecting skills to opportunities...'
}) => {
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [animatingOut, setAnimatingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, minDuration);
    return () => clearTimeout(timer);
  }, [minDuration]);

  useEffect(() => {
    if (minTimeElapsed && ready) {
      setAnimatingOut(true);
      const exitTimer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 250);
      return () => clearTimeout(exitTimer);
    }
  }, [minTimeElapsed, ready, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white transition-opacity duration-300 ${
        animatingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative flex flex-col items-center max-w-sm text-center px-6">
        {/* Graph-node animation visual: Progressive connecting nodes */}
        <div className="relative w-28 h-28 mb-6">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Animated connection lines */}
            <line
              x1="50"
              y1="25"
              x2="25"
              y2="65"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeDasharray="60"
              strokeDashoffset="60"
              className="animate-[dash_1s_ease-out_forwards]"
            />
            <line
              x1="50"
              y1="25"
              x2="75"
              y2="65"
              stroke="#60A5FA"
              strokeWidth="2"
              strokeDasharray="60"
              strokeDashoffset="60"
              className="animate-[dash_1.2s_ease-out_0.2s_forwards]"
            />
            <line
              x1="25"
              y1="65"
              x2="75"
              y2="65"
              stroke="#10B981"
              strokeWidth="2"
              strokeDasharray="60"
              strokeDashoffset="60"
              className="animate-[dash_1.4s_ease-out_0.4s_forwards]"
            />
            <line
              x1="50"
              y1="25"
              x2="50"
              y2="85"
              stroke="#A855F7"
              strokeWidth="1.5"
              strokeDasharray="60"
              strokeDashoffset="0"
              className="opacity-70"
            />

            {/* Central / Top Node: Student */}
            <circle
              cx="50"
              cy="25"
              r="7"
              className="fill-blue-500 animate-pulse"
            />
            <circle cx="50" cy="25" r="3" className="fill-white" />

            {/* Left Node: Skill */}
            <circle
              cx="25"
              cy="65"
              r="6"
              className="fill-emerald-500"
            />
            <circle cx="25" cy="65" r="2.5" className="fill-white" />

            {/* Right Node: Job */}
            <circle
              cx="75"
              cy="65"
              r="6"
              className="fill-blue-400"
            />
            <circle cx="75" cy="65" r="2.5" className="fill-white" />

            {/* Bottom Node: Company */}
            <circle
              cx="50"
              cy="85"
              r="5"
              className="fill-purple-400"
            />
            <circle cx="50" cy="85" r="2" className="fill-white" />
          </svg>
        </div>

        {/* Center Title */}
        <h1 className="text-2xl font-black tracking-widest text-white mb-1.5 font-mono">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="text-xs font-medium text-slate-300 tracking-wide">
          {subtitle}
        </p>

        {/* Micro loader line */}
        <div className="w-32 h-1 bg-slate-800 rounded-full mt-6 overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full animate-[progress_1s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
};
