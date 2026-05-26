export default function Input({ label, error, register, name, className, style, ...props }) {
  const inputProps = register && name ? register(name) : {};

  return (
    <label style={{ display: 'block', width: '100%', ...style }} className={className}>
      {label ? (
        <span style={{ display: 'block', marginBottom: 6, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text2)' }}>
          {label}
        </span>
      ) : null}
      <input
        {...inputProps}
        {...props}
        style={{
          width: '100%',
          background: 'transparent',
          color: 'var(--text)',
          border: 'none',
          borderBottom: '1px solid var(--border)',
          padding: '10px 0',
          outline: 'none',
          transition: 'border-color 200ms ease',
          ...props.style
        }}
        onFocus={(event) => {
          event.currentTarget.style.borderBottomColor = 'var(--text)';
          props.onFocus?.(event);
        }}
        onBlur={(event) => {
          event.currentTarget.style.borderBottomColor = 'var(--border)';
          props.onBlur?.(event);
        }}
      />
      {error ? <span style={{ display: 'block', marginTop: 6, fontSize: 12, color: 'var(--danger)' }}>{error}</span> : null}
    </label>
  );
}
