import React from 'react';
import { OrderStatus, CustomRequestStatus, AccountStatus, EnrollmentStatus } from '../../types';

interface StatusBadgeProps {
  status: OrderStatus | CustomRequestStatus | AccountStatus | EnrollmentStatus | string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const norm = String(status).toLowerCase().replace(/_/g, ' ');

  // Semantic styles - disciplined, minimal, anti-pill aesthetic
  let dotColor = 'bg-stone-400';
  let textColor = 'text-stone-700 dark:text-stone-300';
  let label = norm;

  if (norm === 'pending') {
    dotColor = 'bg-amber-500';
    textColor = 'text-amber-800 dark:text-amber-300';
    label = 'Pending';
  } else if (norm === 'processing' || norm === 'in progress') {
    dotColor = 'bg-blue-500';
    textColor = 'text-blue-800 dark:text-blue-300';
    label = norm === 'processing' ? 'Processing' : 'In Progress';
  } else if (norm === 'completed' || norm === 'approved' || norm === 'active') {
    dotColor = 'bg-emerald-500';
    textColor = 'text-emerald-800 dark:text-emerald-300';
    label = norm.charAt(0).toUpperCase() + norm.slice(1);
  } else if (norm === 'cancelled' || norm === 'rejected' || norm === 'suspended') {
    dotColor = 'bg-rose-500';
    textColor = 'text-rose-800 dark:text-rose-300';
    label = norm.charAt(0).toUpperCase() + norm.slice(1);
  } else if (norm === 'not started') {
    dotColor = 'bg-stone-400';
    textColor = 'text-stone-600 dark:text-stone-400';
    label = 'Not Started';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${textColor} ${className}`}
      role="status"
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} aria-hidden="true" />
      <span className="capitalize">{label}</span>
    </span>
  );
}
