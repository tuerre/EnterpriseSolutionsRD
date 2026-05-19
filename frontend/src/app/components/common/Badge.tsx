import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variantClasses = {
    default: 'bg-white/10 text-[#94a3b8] border border-white/10',
    success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
    info: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
    primary: 'bg-[#d946ef]/20 text-[#d946ef] border border-[#d946ef]/30'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full transition-all duration-300 ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
