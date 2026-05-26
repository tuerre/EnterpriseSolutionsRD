import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Buscar...',
  className = ''
}: SearchBarProps) {
  return (
    <div className={`relative group ${className}`}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8] group-focus-within:text-[#10b981] transition-colors duration-300" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-12 py-3.5 glass rounded-2xl text-white placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all duration-300"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#10b981] transition-colors duration-300"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
