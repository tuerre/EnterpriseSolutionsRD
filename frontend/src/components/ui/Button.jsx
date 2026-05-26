import Spinner from './Spinner';

const variants = {
  primary: {
    background: 'var(--accent)',
    color: 'var(--bg)',
    border: '1px solid transparent'
  },
  secondary: {
    background: 'transparent',
    color: 'var(--text)',
    border: '1px solid var(--border)'
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text2)',
    border: '1px solid transparent'
  },
  danger: {
    background: 'transparent',
    color: 'var(--danger)',
    border: '1px solid var(--danger)'
  }
};

const sizes = {
  sm: { padding: '8px 12px', fontSize: '12px' },
  md: { padding: '10px 16px', fontSize: '13px' },
  lg: { padding: '12px 20px', fontSize: '14px' }
};

export default function Button({ variant = 'primary', size = 'md', loading = false, disabled = false, onClick, children, type = 'button', style, ...props }) {
  const isDisabled = disabled || loading;
  const variantStyle = variants[variant] || variants.primary;
  const sizeStyle = sizes[size] || sizes.md;

  const hoverStyle = variant === 'primary'
    ? { background: 'var(--accent-hover)' }
    : variant === 'secondary'
      ? { borderColor: 'var(--border-hover)' }
      : variant === 'ghost'
        ? { background: 'var(--surface2)', color: 'var(--text)' }
        : { background: 'var(--danger)', color: '#fff' };

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      style={{
        ...variantStyle,
        ...sizeStyle,
        borderRadius: 3,
        fontFamily: 'Inter, sans-serif',
        letterSpacing: '0.04em',
        fontWeight: 400,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        transition: 'all 200ms ease',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        outline: 'none',
        width: style?.width,
        ...style
      }}
      onMouseEnter={(event) => {
        if (!isDisabled) Object.assign(event.currentTarget.style, hoverStyle);
      }}
      onMouseLeave={(event) => {
        Object.assign(event.currentTarget.style, variantStyle);
        event.currentTarget.style.opacity = isDisabled ? 0.5 : 1;
      }}
      {...props}
    >
      {loading ? <Spinner size={12} /> : null}
      {children}
    </button>
  );
}
