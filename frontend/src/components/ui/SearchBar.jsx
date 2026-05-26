import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Buscar...' }) {
  return (
    <label style={{ position: 'relative', display: 'block', width: '100%' }}>
      <Search size={16} color="var(--text3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%',
          background: 'transparent',
          color: 'var(--text)',
          border: '1px solid var(--border)',
          borderRadius: 3,
          padding: '8px 12px 8px 36px',
          outline: 'none',
          transition: 'border-color 200ms ease'
        }}
        onFocus={(event) => (event.currentTarget.style.borderColor = 'var(--text)')}
        onBlur={(event) => (event.currentTarget.style.borderColor = 'var(--border)')}
      />
    </label>
  );
}
