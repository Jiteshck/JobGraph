import React from 'react';
import { AlertCircle, RefreshCw, Database, FileX, CheckCircle2 } from 'lucide-react';

interface LoadingSkeletonProps {
  count?: number;
  message?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  count = 3, 
  message = 'Executing Graph Traversal in Neo4j...' 
}) => {
  return (
    <div className="w-full space-y-4 py-8 animate-pulse">
      <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
        <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
        <span>{message}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="p-5 bg-white border border-slate-200 rounded-lg space-y-3">
            <div className="h-5 bg-slate-200 rounded w-2/3" />
            <div className="h-4 bg-slate-100 rounded w-1/2" />
            <div className="h-12 bg-slate-50 rounded" />
            <div className="h-4 bg-slate-100 rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
};

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction
}) => {
  return (
    <div className="w-full py-16 px-6 text-center bg-white border border-dashed border-slate-300 rounded-xl">
      <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <FileX className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="w-full p-6 bg-red-50/70 border border-red-200 rounded-xl text-red-900">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-red-800">Graph Database Operation Failed</h4>
          <p className="text-xs text-red-700 mt-1 font-mono break-all">{message}</p>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={onRetry}
              className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 active:bg-red-800 transition-colors inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Query
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PresentationStateControlsProps {
  simulatedLatency: number;
  onLatencyChange: (ms: number) => void;
  forceError: boolean;
  onToggleForceError: (val: boolean) => void;
  forceEmpty: boolean;
  onToggleForceEmpty: (val: boolean) => void;
  onResetDatabase: () => void;
}

export const PresentationStateControls: React.FC<PresentationStateControlsProps> = ({
  simulatedLatency,
  onLatencyChange,
  forceError,
  onToggleForceError,
  forceEmpty,
  onToggleForceEmpty,
  onResetDatabase
}) => {
  return (
    <div className="p-3 bg-slate-900 text-white rounded-lg text-xs space-y-2 border border-slate-800">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <span className="font-semibold text-slate-200 flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-blue-400" />
          Academic Viva & State Testing Panel
        </span>
        <button
          onClick={onResetDatabase}
          className="text-[11px] text-slate-400 hover:text-white transition-colors underline"
        >
          Reset Default Data
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
        <div>
          <label className="text-slate-400 block mb-1">Simulated Express Latency</label>
          <div className="flex items-center gap-1">
            {[0, 300, 700].map(ms => (
              <button
                key={ms}
                onClick={() => onLatencyChange(ms)}
                className={`px-2 py-1 rounded text-[11px] transition-colors ${
                  simulatedLatency === ms 
                    ? 'bg-blue-600 text-white font-medium' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {ms === 0 ? '0ms (Fast)' : `${ms}ms`}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-slate-400 block mb-1">Simulate Network/Driver Error</label>
          <button
            onClick={() => onToggleForceError(!forceError)}
            className={`w-full px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              forceError
                ? 'bg-red-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {forceError ? 'Error Active (Simulated)' : 'Normal Status (No Error)'}
          </button>
        </div>

        <div>
          <label className="text-slate-400 block mb-1">Simulate Empty Records State</label>
          <button
            onClick={() => onToggleForceEmpty(!forceEmpty)}
            className={`w-full px-2 py-1 rounded text-[11px] font-medium transition-colors ${
              forceEmpty
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {forceEmpty ? 'Empty State Active' : 'Populated Data State'}
          </button>
        </div>
      </div>
    </div>
  );
};
