export default function Badge({ active, status, color, children, style }) {
  const palette = color || (typeof active === 'boolean' ? (active ? 'var(--success)' : 'var(--danger)') : 'var(--text2)');
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1px solid ${palette}`,
        color: palette,
        background: palette === 'var(--success)'
          ? 'rgba(39,174,96,0.08)'
          : palette === 'var(--danger)'
            ? 'rgba(192,57,43,0.08)'
            : 'transparent',
        borderRadius: 2,
        fontSize: 11,
        padding: '2px 8px',
        letterSpacing: '0.06em',
        fontWeight: 400,
        textTransform: 'uppercase',
        ...style
      }}
    >
      {children ?? status ?? (active ? 'Activo' : 'Inactivo')}
    </span>
  );
}
