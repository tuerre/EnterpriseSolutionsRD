import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
  hover?: boolean;
}

export function Card({ children, className = '', title, description, action, hover = true }: CardProps) {
  return (
    <div className={`glass rounded-2xl overflow-hidden transition-all duration-300 ${hover ? 'glass-hover' : ''} ${className}`}>
      {(title || description || action) && (
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            {title && <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>}
            {description && <p className="text-sm text-[#94a3b8] mt-1">{description}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
