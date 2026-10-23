import React from 'react';
import { VerificationState } from '../types';

interface FeatureStatusBadgeProps {
  state: VerificationState;
  className?: string;
}

export const FeatureStatusBadge: React.FC<FeatureStatusBadgeProps> = ({ state, className = '' }) => {
  // Respecting zero-pill anti-slop guidelines: clean border or text with clear status indication
  let styleClasses = 'text-xs font-medium px-2 py-0.5 rounded border inline-flex items-center gap-1.5';
  let dotColor = 'bg-slate-400';

  switch (state) {
    case 'Implemented and software-tested':
      styleClasses += ' border-emerald-300 bg-emerald-50 text-emerald-800';
      dotColor = 'bg-emerald-600';
      break;
    case 'Demonstration-only':
      styleClasses += ' border-amber-300 bg-amber-50 text-amber-800';
      dotColor = 'bg-amber-600';
      break;
    case 'Awaiting hardware integration':
      styleClasses += ' border-blue-300 bg-blue-50 text-blue-800';
      dotColor = 'bg-blue-600';
      break;
    case 'Awaiting calibration':
      styleClasses += ' border-orange-300 bg-orange-50 text-orange-800';
      dotColor = 'bg-orange-600';
      break;
    case 'Awaiting physical testing':
      styleClasses += ' border-purple-300 bg-purple-50 text-purple-800';
      dotColor = 'bg-purple-600';
      break;
    case 'Planned future functionality':
      styleClasses += ' border-slate-300 bg-slate-100 text-slate-700';
      dotColor = 'bg-slate-500';
      break;
  }

  return (
    <span className={`${styleClasses} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
      <span>{state}</span>
    </span>
  );
};
